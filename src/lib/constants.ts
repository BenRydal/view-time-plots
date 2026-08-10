import type { PlayMethod, MethodGroup } from './types';

export const COLOR_MAP: Record<PlayMethod, string> = {
  jrev: '#756bb1',   // dark purple
  frev: '#bcbddc',   // mid purple
  srev: '#efedf5',   // light purple
  still: '#000000',  // black
  sfwd: '#feedde',   // light light orange
  play: '#fdbe85',   // light orange
  ffwd: '#fd8d3c',   // mid orange
  jfwd: '#d94701',   // dark orange
};

// Histogram fills. COLOR_MAP is tuned for hairline rects in the scatter, where the
// near-white steps (srev #efedf5, sfwd #feedde) are fine; as area fills they sit at
// ~1.1:1 against the plot background and disappear. These keep the same diverging
// meaning — purple = reverse, orange = forward, neutral = still — re-stepped so every
// slot stays legible, with a true neutral rather than black at the midpoint.
export const HIST_GROUP_COLOR: Record<MethodGroup, string> = {
  rev: '#5b3d9e',
  still: '#8f8f8f',
  fwd: '#e6550d',
};

export const HIST_METHOD_COLOR: Record<PlayMethod, string> = {
  jrev: '#5b3d9e',
  frev: '#8a72c4',
  srev: '#b9aede',
  still: '#8f8f8f',
  sfwd: '#fcc08a',
  play: '#f2903f',
  ffwd: '#e6550d',
  jfwd: '#9c3606',
};

export interface ExampleDataset {
  label: string;
  csvPath: string;
  youtubeId: string;
}

export const EXAMPLE_DATASETS: ExampleDataset[] = [
  { label: 'Case 1: Shirin Vossoughi', csvPath: 'data/example-1/units.csv', youtubeId: 'HjBvwRSG_jY' },
  { label: 'Case 2: Rogers/Ben', csvPath: 'data/example-2/units.csv', youtubeId: 'agUUzmtjsR0' },
  { label: 'Case 3: Jurgen Streeck', csvPath: 'data/example-3/units.csv', youtubeId: 'S8IJKA7t9cE' },
  { label: 'Case 4: Barbara/Andy', csvPath: 'data/example-4/units.csv', youtubeId: 'bOT48kMRL1g' },
  { label: 'Case 5: Miriam Sherin', csvPath: 'data/example-5/units.csv', youtubeId: '9Qa1T4pwUYo' },
  { label: 'Case 6: Fred Erickson', csvPath: 'data/example-6/units.csv', youtubeId: 'vhthoOHXMSI' },
];

export const VID_LENGTH = 119; // video length in seconds
export const ANALYST_LENGTH = 3300; // max analyst time in seconds
