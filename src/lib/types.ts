export type PlayMethod = 'jrev' | 'frev' | 'srev' | 'still' | 'sfwd' | 'play' | 'ffwd' | 'jfwd';

export interface Unit {
  playMethod: PlayMethod;
  tStartVid: number;
  tEndVid: number;
  tStartAnalyst: number;
  tEndAnalyst: number;
  analyst: string;
  unitName: string;
}

export type VideoSourceType = 'youtube' | 'local' | 'none';

export interface VideoSource {
  type: VideoSourceType;
  id?: string;   // YouTube video ID
  url?: string;  // Local video object URL
}

export type ViewMode = 'normal' | 'scaled';

/** Coarse direction of travel through the video, used by the histogram. */
export type MethodGroup = 'rev' | 'still' | 'fwd';

/** What a unit contributes to a histogram bin. */
export type HistWeight = 'analyst' | 'count' | 'video';

/** Whether the histogram stacks 3 direction groups or all 8 methods. */
export type HistGrouping = 'grouped' | 'detailed';
