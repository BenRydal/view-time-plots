import { writable, derived } from 'svelte/store';
import type { Unit, VideoSource, ViewMode, PlayMethod } from './types';
import { VID_LENGTH, ANALYST_LENGTH } from './constants';

export const ALL_METHODS: PlayMethod[] = ['jrev', 'frev', 'srev', 'still', 'sfwd', 'play', 'ffwd', 'jfwd'];
export const activeMethods = writable<Set<PlayMethod>>(new Set(ALL_METHODS));

export const units = writable<Unit[]>([]);
export const videoSource = writable<VideoSource>({ type: 'none' });
export const currentTime = writable<number>(0);
export const viewMode = writable<ViewMode>('normal');
export const vidLength = writable<number>(VID_LENGTH);
export const analystLength = derived(units, ($units) => {
  if ($units.length === 0) return ANALYST_LENGTH;
  return Math.max(...$units.map((u) => u.tEndAnalyst));
});

export const seekRequest = writable<number | null>(null);
