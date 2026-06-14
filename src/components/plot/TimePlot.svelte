<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { units, vidLength, analystLength, viewMode, currentTime, seekRequest, activeMethods } from '../../lib/stores';
  import { COLOR_MAP } from '../../lib/constants';
  import { formatTime } from '../../lib/format';
  import PlotAxes from './PlotAxes.svelte';
  import CursorLine from './CursorLine.svelte';
  import type { Unit } from '../../lib/types';
  import { BarChart3, LayoutGrid } from 'lucide-svelte';

  const margin = { top: 30, right: 20, bottom: 40, left: 70 };
  const MIN_RECT_PX = 0.5;

  let containerWidth = $state(800);
  let containerHeight = $state(600);
  let tooltipUnit: Unit | null = $state(null);
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  let width = $derived(containerWidth - margin.left - margin.right);
  let height = $derived(containerHeight - margin.top - margin.bottom);

  let xScale = $derived(scaleLinear().domain([0, $vidLength]).range([0, width]));
  let yScale = $derived(scaleLinear().domain([0, $analystLength]).range([0, height]));

  function clampedRect(x1: number, x2: number) {
    const w = Math.abs(x2 - x1);
    return { pos: Math.min(x1, x2), size: Math.max(w, MIN_RECT_PX) };
  }

  let filteredUnits = $derived($units.filter((u) => $activeMethods.has(u.playMethod)));

  let rects = $derived((() => {
    const unitsArr = filteredUnits;
    if ($viewMode === 'normal') {
      return unitsArr.map((unit) => {
        const x = clampedRect(xScale(unit.tStartVid), xScale(unit.tEndVid));
        const y = clampedRect(yScale(unit.tStartAnalyst), yScale(unit.tEndAnalyst));
        return { unit, x: x.pos, y: y.pos, w: x.size, h: y.size, color: COLOR_MAP[unit.playMethod] || '#999' };
      });
    }
    const spacing = height / Math.max(unitsArr.length, 1);
    const rectHeight = Math.min(5, spacing * 0.8);
    return unitsArr.map((unit, i) => {
      const x = clampedRect(xScale(unit.tStartVid), xScale(unit.tEndVid));
      return { unit, x: x.pos, y: spacing * i, w: x.size, h: rectHeight, color: COLOR_MAP[unit.playMethod] || '#999' };
    });
  })());

  function handleClick(e: MouseEvent) {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const seekTime = yScale.invert(e.clientY - rect.top - margin.top);
    if (seekTime >= 0 && seekTime <= $analystLength) {
      seekRequest.set(seekTime);
    }
  }

  let cursorY = $derived(yScale($currentTime));
</script>

<div class="w-full h-full flex flex-col">
  <!-- Toolbar -->
  <div class="flex items-center gap-2 px-3 py-1.5 bg-base-200 border-b border-base-300 shrink-0">
    <button
      type="button"
      class="flex items-center gap-1.5 text-xs font-medium text-base-content/70 hover:text-base-content cursor-pointer"
      title="Toggle view mode (S)"
      onclick={() => viewMode.update((v) => (v === 'normal' ? 'scaled' : 'normal'))}
    >
      {#if $viewMode === 'normal'}
        <LayoutGrid size={14} />
        <span>Normal View</span>
      {:else}
        <BarChart3 size={14} />
        <span>Scaled View</span>
      {/if}
    </button>
    <span class="text-xs text-base-content/40 ml-auto">
      {#if filteredUnits.length < $units.length}
        {filteredUnits.length} of {$units.length} units
      {:else}
        {$units.length} units
      {/if}
    </span>
  </div>

  <!-- Plot -->
  <div class="flex-1 min-h-0 relative bg-base-100" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
    <svg width={containerWidth} height={containerHeight} class="block" role="img" onclick={handleClick}>
      <g transform="translate({margin.left},{margin.top})">
        <rect x={0} y={0} {width} {height} fill="#fafafa" stroke="#e5e7eb" />

        {#each rects as r}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <rect
            x={r.x} y={r.y} width={r.w} height={r.h} fill={r.color}
            class="cursor-pointer" role="img"
            onmouseenter={(e: MouseEvent) => { tooltipUnit = r.unit; tooltipX = e.clientX; tooltipY = e.clientY; }}
            onmouseleave={() => { tooltipUnit = null; }}
          />
        {/each}

        {#if $currentTime > 0}
          <CursorLine y={cursorY} {width} />
        {/if}

        <PlotAxes {xScale} {yScale} {height} analystLength={$analystLength} />

        <text x={width / 2} y={-15} text-anchor="middle" class="fill-base-content/50" font-size="12">Video Time</text>
        <text transform="rotate(-90)" x={-height / 2} y={-50} text-anchor="middle" class="fill-base-content/50" font-size="12">Analyst Time</text>
      </g>
    </svg>

    {#if tooltipUnit}
      <div
        class="fixed z-50 bg-neutral text-neutral-content text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none"
        style="left: {tooltipX + 14}px; top: {tooltipY - 12}px;"
      >
        <div class="font-semibold">{tooltipUnit.unitName}</div>
        <div class="opacity-70">{tooltipUnit.playMethod.toUpperCase()}</div>
        <div class="mt-1 opacity-85">Video: {formatTime(tooltipUnit.tStartVid)} – {formatTime(tooltipUnit.tEndVid)}</div>
        <div class="opacity-85">Analyst: {formatTime(tooltipUnit.tStartAnalyst)} – {formatTime(tooltipUnit.tEndAnalyst)}</div>
      </div>
    {/if}
  </div>
</div>
