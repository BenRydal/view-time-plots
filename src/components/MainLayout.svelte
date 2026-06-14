<script lang="ts">
  import TimePlot from './plot/TimePlot.svelte';
  import VideoPanel from './video/VideoPanel.svelte';
  import Legend from './plot/Legend.svelte';
  import { viewMode, units } from '../lib/stores';

  let containerWidth = $state(0);
  let splitRatio = $state(0.55);
  let dragging = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 's' || e.key === 'S') {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      viewMode.update((v) => (v === 'normal' ? 'scaled' : 'normal'));
    }
    // Arrow keys to resize split pane when divider is focused
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const el = document.activeElement;
      if (el && el.getAttribute('role') === 'separator') {
        e.preventDefault();
        const delta = e.key === 'ArrowLeft' ? -0.02 : 0.02;
        splitRatio = Math.min(0.85, Math.max(0.25, splitRatio + delta));
      }
    }
  }

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !containerWidth) return;
    const rect = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    splitRatio = Math.min(0.85, Math.max(0.25, x / rect.width));
  }

  function onPointerUp() {
    dragging = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="flex flex-1 min-h-0 flex-col lg:flex-row relative {dragging ? 'select-none cursor-col-resize' : ''}"
  bind:clientWidth={containerWidth}
>
  <!-- Plot -->
  <div class="min-w-0 min-h-0 hidden lg:block" style="width: {splitRatio * 100}%;">
    <TimePlot />
  </div>
  <!-- Mobile: no split, just stack -->
  <div class="flex-1 min-w-0 min-h-0 lg:hidden">
    <TimePlot />
  </div>

  <!-- Drag handle -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="hidden lg:flex items-center justify-center w-2 cursor-col-resize select-none shrink-0 transition-colors
           {dragging ? 'bg-primary/30' : 'bg-base-300 hover:bg-primary/20'}"
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
    aria-label="Resize pane"
    aria-valuenow={Math.round(splitRatio * 100)}
  >
    <div class="flex flex-col gap-1">
      {#each { length: 3 } as _}
        <div class="w-1 h-1 rounded-full {dragging ? 'bg-primary' : 'bg-base-content/30'}"></div>
      {/each}
    </div>
  </div>

  <!-- Sidebar: video + legend -->
  <div
    class="w-full lg:w-auto shrink-0 flex flex-col min-h-0 overflow-y-auto bg-base-200"
    style="flex: 0 0 {(1 - splitRatio) * 100 - 0.3}%;"
  >
    <VideoPanel />
    <div class="px-4 pb-4">
      <Legend units={$units} />
    </div>
  </div>
</div>
