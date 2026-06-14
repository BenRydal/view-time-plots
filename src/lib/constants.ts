import type { PlayMethod } from './types';

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
