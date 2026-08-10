<script lang="ts">
  import type { ScaleLinear } from 'd3-scale';
  import type { Bin } from '../../lib/histogram';
  import type { HistWeight } from '../../lib/types';
  import { maxBinTotal, formatWeight } from '../../lib/histogram';

  interface Props {
    bins: Bin[];
    keys: string[];
    xScale: ScaleLinear<number, number>;
    width: number;
    height: number;
    weight: HistWeight;
    normalize: boolean;
    colorOf: (key: string) => string;
    onhover: (bin: Bin | null, event?: MouseEvent) => void;
  }

  let { bins, keys, xScale, width, height, weight, normalize, colorOf, onhover }: Props = $props();

  const PAD_TOP = 6; // headroom so the tallest bar never touches the frame
  const CORNER = 3;
  const SEG_GAP = 2; // surface gap between stacked segments

  let peak = $derived(normalize ? 1 : maxBinTotal(bins));
  let scaleY = $derived((v: number) => (peak > 0 ? (v / peak) * (height - PAD_TOP) : 0));

  // Bars are drawn wide enough to leave a hairline of surface between neighbours,
  // but that gap is dropped once bins get too narrow to afford it.
  let slot = $derived(bins.length > 0 ? width / bins.length : width);
  let gap = $derived(slot > 6 ? 1.5 : slot > 3 ? 0.75 : 0);

  interface Segment {
    key: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rounded: boolean;
  }

  let segments = $derived(
    bins.flatMap((bin) => {
      if (bin.total <= 0) return [];
      const x = xScale(bin.x0) + gap / 2;
      const w = Math.max(0.6, xScale(bin.x1) - xScale(bin.x0) - gap);
      const stack = keys.filter((k) => (bin.values[k] || 0) > 0);
      let acc = 0;
      return stack.map((key, i) => {
        const value = normalize ? (bin.values[key] || 0) / bin.total : bin.values[key] || 0;
        const h = scaleY(value);
        const top = height - scaleY(acc) - h;
        acc += value;
        const isTop = i === stack.length - 1;
        const inset = !isTop && h > SEG_GAP + 1 ? SEG_GAP : 0;
        return {
          key,
          x,
          y: top + inset,
          w,
          h: Math.max(0.8, h - inset),
          rounded: isTop && h > CORNER * 2 && w > CORNER * 2,
        } satisfies Segment;
      });
    })
  );

  function roundedTop(s: Segment): string {
    const r = Math.min(CORNER, s.w / 2, s.h);
    return `M${s.x},${s.y + s.h}V${s.y + r}a${r},${r} 0 0 1 ${r},${-r}H${s.x + s.w - r}a${r},${r} 0 0 1 ${r},${r}V${s.y + s.h}Z`;
  }

  let gridLines = $derived(
    peak > 0 ? [0.5, 1].map((f) => ({ f, y: height - scaleY(peak * f), label: formatWeight(peak * f, weight, normalize) })) : []
  );
</script>

<g class="video-histogram">
  <rect x={0} y={0} {width} {height} fill="#fafafa" stroke="#e5e7eb" />

  {#each gridLines as line}
    <line x1={0} y1={line.y} x2={width} y2={line.y} stroke="#e5e7eb" stroke-width="1" />
    <text
      x={-6}
      y={line.y + 3.5}
      text-anchor="end"
      font-size="9"
      class="fill-base-content/40 tabular-nums"
    >
      {line.label}
    </text>
  {/each}

  {#each segments as seg}
    {#if seg.rounded}
      <path d={roundedTop(seg)} fill={colorOf(seg.key)} />
    {:else}
      <rect x={seg.x} y={seg.y} width={seg.w} height={seg.h} fill={colorOf(seg.key)} />
    {/if}
  {/each}

  <!-- Hover targets span the full band height so thin bars stay easy to hit. -->
  {#each bins as bin}
    {#if bin.total > 0}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <rect
        x={xScale(bin.x0)}
        y={0}
        width={Math.max(1, xScale(bin.x1) - xScale(bin.x0))}
        {height}
        fill="transparent"
        class="cursor-crosshair"
        onmousemove={(e: MouseEvent) => onhover(bin, e)}
        onmouseleave={() => onhover(null)}
      />
    {/if}
  {/each}
</g>
