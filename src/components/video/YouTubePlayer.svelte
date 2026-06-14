<script lang="ts">
  import { onDestroy } from 'svelte';
  import { currentTime, seekRequest } from '../../lib/stores';

  interface Props {
    videoId: string;
  }

  let { videoId }: Props = $props();

  let container: HTMLDivElement;
  let player: any = null;
  let rafId: number;
  let ready = $state(false);

  function loadYTApi(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).YT?.Player) {
        resolve();
        return;
      }
      (window as any).onYouTubeIframeAPIReady = () => resolve();
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
    });
  }

  function createPlayer(id: string) {
    if (player) {
      player.destroy();
      player = null;
    }
    ready = false;

    player = new (window as any).YT.Player(container, {
      videoId: id,
      playerVars: { disablekb: 1 },
      events: {
        onReady: () => {
          ready = true;
          startTimeLoop();
        },
      },
    });
  }

  function startTimeLoop() {
    function update() {
      if (player && ready && typeof player.getCurrentTime === 'function') {
        currentTime.set(player.getCurrentTime());
      }
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);
  }

  $effect(() => {
    if (videoId && container) {
      loadYTApi().then(() => createPlayer(videoId));
    }
  });

  $effect(() => {
    const seekTime = $seekRequest;
    if (seekTime !== null && player && ready) {
      player.seekTo(seekTime, true);
      player.playVideo();
      seekRequest.set(null);
    }
  });

  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
    if (player) {
      try { player.destroy(); } catch {}
    }
  });
</script>

<div class="w-full aspect-video">
  <div bind:this={container} class="w-full h-full"></div>
</div>
