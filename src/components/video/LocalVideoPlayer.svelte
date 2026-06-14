<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { currentTime, seekRequest } from '../../lib/stores';

  interface Props {
    url: string;
  }

  let { url }: Props = $props();

  let videoEl: HTMLVideoElement;
  let rafId: number;

  function startTimeLoop() {
    function update() {
      if (videoEl && !videoEl.paused) {
        currentTime.set(videoEl.currentTime);
      }
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);
  }

  onMount(() => {
    startTimeLoop();
  });

  // React to seek requests
  $effect(() => {
    const seekTime = $seekRequest;
    if (seekTime !== null && videoEl) {
      videoEl.currentTime = seekTime;
      videoEl.play();
      seekRequest.set(null);
    }
  });

  onDestroy(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });
</script>

<div class="w-full aspect-video">
  <!-- svelte-ignore a11y_media_has_caption -->
  <video
    bind:this={videoEl}
    src={url}
    controls
    class="w-full h-full bg-black"
  ></video>
</div>
