import type { Unit, PlayMethod, MethodGroup, HistWeight, HistGrouping } from './types';

export const GROUP_OF: Record<PlayMethod, MethodGroup> = {
  jrev: 'rev',
  frev: 'rev',
  srev: 'rev',
  still: 'still',
  sfwd: 'fwd',
  play: 'fwd',
  ffwd: 'fwd',
  jfwd: 'fwd',
};

export const GROUPS: MethodGroup[] = ['rev', 'still', 'fwd'];

export const GROUP_LABEL: Record<MethodGroup, string> = {
  rev: 'Reverse',
  still: 'Still',
  fwd: 'Forward',
};

export const BIN_WIDTHS = [1, 2, 5, 10, 15, 30];

export interface Bin {
  x0: number;
  x1: number;
  /** Weight per series key — a MethodGroup when grouped, a PlayMethod when detailed. */
  values: Record<string, number>;
  total: number;
}

/**
 * How much a unit contributes to the histogram.
 *
 * `analyst` is the meaningful default: it answers "how much analyst attention did
 * this moment of video receive". `video` deliberately drops STILL units, which have
 * no video extent at all — that mode measures ground covered, not time spent.
 */
export function unitWeight(unit: Unit, weight: HistWeight): number {
  switch (weight) {
    case 'analyst':
      return unit.tEndAnalyst - unit.tStartAnalyst;
    case 'video':
      return Math.abs(unit.tEndVid - unit.tStartVid);
    case 'count':
      return 1;
  }
}

export function seriesKey(method: PlayMethod, grouping: HistGrouping): string {
  return grouping === 'grouped' ? GROUP_OF[method] ?? 'still' : method;
}

/**
 * Bin units over video time.
 *
 * Two properties of this data drive the implementation:
 *  - STILL units have `tStartVid === tEndVid` — zero video extent but often large
 *    analyst duration. Their whole weight lands in the single bin containing that
 *    timestamp; spreading them proportionally would divide by zero.
 *  - Reverse units (jrev/frev/srev) run backwards, so `tEndVid < tStartVid`. The
 *    span is normalised before any overlap maths.
 *
 * Weight is spread across bins in proportion to overlap, so the sum over all bins
 * equals the sum of `unitWeight` over all units regardless of bin width.
 */
export function binUnits(
  units: Unit[],
  vidLength: number,
  binWidth: number,
  weight: HistWeight,
  grouping: HistGrouping
): Bin[] {
  if (!(vidLength > 0) || !(binWidth > 0)) return [];

  const count = Math.max(1, Math.ceil(vidLength / binWidth));
  const bins: Bin[] = Array.from({ length: count }, (_, i) => ({
    x0: i * binWidth,
    x1: Math.min((i + 1) * binWidth, vidLength),
    values: {},
    total: 0,
  }));

  const binAt = (t: number) => Math.min(count - 1, Math.max(0, Math.floor(t / binWidth)));

  for (const unit of units) {
    const w = unitWeight(unit, weight);
    if (!(w > 0)) continue;

    const key = seriesKey(unit.playMethod, grouping);
    const add = (bin: Bin, amount: number) => {
      bin.values[key] = (bin.values[key] || 0) + amount;
      bin.total += amount;
    };

    const start = Math.min(unit.tStartVid, unit.tEndVid);
    const end = Math.max(unit.tStartVid, unit.tEndVid);

    if (end === start) {
      add(bins[binAt(start)], w);
      continue;
    }

    const first = binAt(start);
    const last = binAt(end);
    for (let i = first; i <= last; i++) {
      const overlap = Math.min(end, bins[i].x1) - Math.max(start, bins[i].x0);
      if (overlap > 0) add(bins[i], (w * overlap) / (end - start));
    }
  }

  return bins;
}

/** Series keys present anywhere in `units`, in canonical order. */
export function seriesKeys(
  units: Unit[],
  grouping: HistGrouping,
  allMethods: PlayMethod[]
): string[] {
  const present = new Set(units.map((u) => seriesKey(u.playMethod, grouping)));
  const order: string[] = grouping === 'grouped' ? GROUPS : allMethods;
  return order.filter((k) => present.has(k));
}

export function maxBinTotal(bins: Bin[]): number {
  return bins.reduce((m, b) => Math.max(m, b.total), 0);
}

/** Weight in seconds → compact label. Counts stay numeric. */
export function formatWeight(value: number, weight: HistWeight, normalized: boolean): string {
  if (normalized) return `${Math.round(value * 100)}%`;
  if (weight === 'count') return value < 10 ? value.toFixed(1) : String(Math.round(value));
  const total = Math.round(value);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}
