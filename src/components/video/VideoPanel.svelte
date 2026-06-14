<script lang="ts">
  import { videoSource } from '../../lib/stores';
  import YouTubePlayer from './YouTubePlayer.svelte';
  import LocalVideoPlayer from './LocalVideoPlayer.svelte';
  import { Video, Youtube, MonitorPlay } from 'lucide-svelte';
</script>

<div class="p-4 flex flex-col gap-3">
  <div class="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
    <!-- Card header -->
    <div class="flex items-center gap-2 px-3 py-2 bg-base-200 border-b border-base-300">
      <MonitorPlay size={14} class="text-base-content/60" />
      <span class="text-xs font-semibold text-base-content/70">Video Player</span>
      {#if $videoSource.type === 'youtube'}
        <span class="badge badge-sm badge-secondary gap-1 ml-auto">
          <Youtube size={10} />
          YouTube
        </span>
      {:else if $videoSource.type === 'local'}
        <span class="badge badge-sm badge-accent gap-1 ml-auto">
          <Video size={10} />
          Local
        </span>
      {/if}
    </div>

    <!-- Video content -->
    <div>
      {#if $videoSource.type === 'youtube' && $videoSource.id}
        <YouTubePlayer videoId={$videoSource.id} />
      {:else if $videoSource.type === 'local' && $videoSource.url}
        <LocalVideoPlayer url={$videoSource.url} />
      {:else}
        <div class="w-full aspect-video bg-base-200 flex flex-col items-center justify-center gap-2 text-base-content/30">
          <Video size={40} />
          <span class="text-sm">No video loaded</span>
          <span class="text-xs">Select a dataset or import a video</span>
        </div>
      {/if}
    </div>
  </div>
</div>
