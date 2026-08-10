<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import {
    units,
    vidLength,
    analystLength,
    viewMode,
    currentTime,
    seekRequest,
    activeMethods,
    ALL_METHODS,
    showHistogram,
    binWidth,
    histWeight,
    histGrouping,
    histNormalize,
  } from '../../lib/stores';
  import { COLOR_MAP, HIST_GROUP_COLOR, HIST_METHOD_COLOR } from '../../lib/constants';
  import { formatTime } from '../../lib/format';
  import {
    binUnits,
    seriesKeys,
    formatWeight,
    GROUP_LABEL,
    BIN_WIDTHS,
  } from '../../lib/histogram';
  import PlotAxes from './PlotAxes.svelte';
  import CursorLine from './CursorLine.svelte';
  import VideoHistogram from './VideoHistogram.svelte';
  import type { Unit, PlayMethod, MethodGroup } from '../../lib/types';
  import type { Bin } from '../../lib/histogram';
  import { BarChart3, LayoutGrid, ChartColumnBig } from 'lucide-svelte';

  const margin = { top: 30, right: 20, bottom: 40, left: 70 };
  const MIN_RECT_PX = 0.5;
  const HIST_HEIGHT = 110;
  const HIST_GAP = 28; // breathing room between the histogram baseline and the plot frame

  let containerWidth = $state(800);
  let containerHeight = $state(600);
  let tooltipUnit: Unit | null = $state(null);
  let tooltipBin: Bin | null = $state(null);
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  // The histogram lives above the video-time axis inside the same SVG, so it shares
  // xScale exactly. Its band is carved out of the top margin.
  let histOffset = $derived($showHistogram ? HIST_HEIGHT + HIST_GAP : 0);
  let topPad = $derived(margin.top + histOffset);

  let width = $derived(containerWidth - margin.left - margin.right);
  let height = $derived(containerHeight - topPad - margin.bottom);

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

  // Histogram bins the same units the scatter shows, so the legend filters both.
  let bins = $derived(
    $showHistogram ? binUnits(filteredUnits, $vidLength, $binWidth, $histWeight, $histGrouping) : []
  );

  // Keys come from the unfiltered set so a series keeps its colour when others are
  // toggled off — colour follows the category, never its rank in the stack.
  let histKeys = $derived(seriesKeys($units, $histGrouping, ALL_METHODS));

  let activeHistKeys = $derived(
    histKeys.filter((k) => bins.some((b) => (b.values[k] || 0) > 0))
  );

  function histColor(key: string): string {
    return $histGrouping === 'grouped'
      ? HIST_GROUP_COLOR[key as MethodGroup] || '#999'
      : HIST_METHOD_COLOR[key as PlayMethod] || '#999';
  }

  function keyLabel(key: string): string {
    return $histGrouping === 'grouped' ? GROUP_LABEL[key as MethodGroup] || key : key;
  }

  function handleBinHover(bin: Bin | null, e?: MouseEvent) {
    tooltipBin = bin;
    if (bin && e) {
      tooltipX = e.clientX;
      tooltipY = e.clientY;
    }
  }

  function handleClick(e: MouseEvent) {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const seekTime = yScale.invert(e.clientY - rect.top - topPad);
    if (seekTime >= 0 && seekTime <= $analystLength) {
      seekRequest.set(seekTime);
    }
  }

  let cursorY = $derived(yScale($currentTime));

  const WEIGHT_LABEL: Record<string, string> = {
    analyst: 'Analyst time',
    count: 'Unit count',
    video: 'Video coverage',
  };
</script>

<div class="w-full h-full flex flex-col">
  <!-- Toolbar -->
  <div class="flex items-center flex-wrap gap-x-3 gap-y-1.5 px-3 py-1.5 bg-base-200 border-b border-base-300 shrink-0">
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

    <div class="w-px h-4 bg-base-300"></div>

    <button
      type="button"
      class="flex items-center gap-1.5 text-xs font-medium cursor-pointer {$showHistogram
        ? 'text-base-content'
        : 'text-base-content/50 hover:text-base-content'}"
      title="Toggle histogram (H)"
      aria-pressed={$showHistogram}
      onclick={() => showHistogram.update((v) => !v)}
    >
      <ChartColumnBig size={14} />
      <span>Histogram</span>
    </button>

    {#if $showHistogram}
      <label class="flex items-center gap-1 text-xs text-base-content/60">
        <span>Bins</span>
        <select
          class="select select-xs select-ghost w-[4.5rem] text-xs"
          value={$binWidth}
          onchange={(e) => binWidth.set(Number((e.currentTarget as HTMLSelectElement).value))}
          aria-label="Bin width in seconds"
        >
          {#each BIN_WIDTHS as w}
            <option value={w}>{w}s</option>
          {/each}
        </select>
      </label>

      <label class="flex items-center gap-1 text-xs text-base-content/60">
        <span>By</span>
        <select
          class="select select-xs select-ghost w-[8.5rem] text-xs"
          value={$histWeight}
          onchange={(e) => histWeight.set((e.currentTarget as HTMLSelectElement).value as any)}
          aria-label="Weight bins by"
        >
          <option value="analyst">Analyst time</option>
          <option value="count">Unit count</option>
          <option value="video">Video coverage</option>
        </select>
      </label>

      <label class="flex items-center gap-1 text-xs text-base-content/60">
        <span>Detail</span>
        <select
          class="select select-xs select-ghost w-[7rem] text-xs"
          value={$histGrouping}
          onchange={(e) => histGrouping.set((e.currentTarget as HTMLSelectElement).value as any)}
          aria-label="Category detail"
        >
          <option value="grouped">3 groups</option>
          <option value="detailed">8 methods</option>
        </select>
      </label>

      <label class="flex items-center gap-1.5 text-xs text-base-content/60 cursor-pointer">
        <input
          type="checkbox"
          class="checkbox checkbox-xs"
          checked={$histNormalize}
          onchange={(e) => histNormalize.set((e.currentTarget as HTMLInputElement).checked)}
        />
        <span>100%</span>
      </label>
    {/if}

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
      <g transform="translate({margin.left},{topPad})">
        {#if $showHistogram && width > 0 && height > 0}
          <g transform="translate(0,{-histOffset})">
            <VideoHistogram
              {bins}
              keys={activeHistKeys}
              {xScale}
              {width}
              height={HIST_HEIGHT}
              weight={$histWeight}
              normalize={$histNormalize}
              colorOf={histColor}
              onhover={handleBinHover}
            />
          </g>
        {/if}

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

        <text x={width / 2} y={-histOffset - 15} text-anchor="middle" class="fill-base-content/50" font-size="12">Video Time</text>
        <text transform="rotate(-90)" x={-height / 2} y={-50} text-anchor="middle" class="fill-base-content/50" font-size="12">Analyst Time</text>
      </g>
    </svg>

    {#if tooltipBin}
      <div
        class="fixed z-50 bg-neutral text-neutral-content text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none min-w-36"
        style="left: {tooltipX + 14}px; top: {tooltipY - 12}px;"
      >
        <div class="font-semibold tabular-nums">
          {formatTime(tooltipBin.x0)} – {formatTime(tooltipBin.x1)}
        </div>
        <div class="opacity-60 text-[10px] mb-1">{WEIGHT_LABEL[$histWeight]}</div>
        {#each activeHistKeys as key}
          {@const raw = tooltipBin.values[key] || 0}
          {#if raw > 0}
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-xs shrink-0" style="background-color: {histColor(key)};"></span>
              <span>{keyLabel(key)}</span>
              <span class="ml-auto tabular-nums opacity-85">
                {formatWeight($histNormalize ? raw / tooltipBin.total : raw, $histWeight, $histNormalize)}
              </span>
            </div>
          {/if}
        {/each}
      </div>
    {:else if tooltipUnit}
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
