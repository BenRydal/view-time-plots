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
