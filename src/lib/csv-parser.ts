import { csvParse } from 'd3-dsv';
import type { Unit, PlayMethod } from './types';

export function timecodeToSeconds(timecode: string): number {
  const parts = timecode.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export function parseCSV(csvText: string): Unit[] {
  // Handle BOM character
  const cleaned = csvText.replace(/^\uFEFF/, '');

  const rows = csvParse(cleaned);
  const units: Unit[] = [];

  for (const row of rows) {
    const method = (row['Method'] || '').trim().toLowerCase();
    const tStartVid = row['TStartVid'] || '';
    const tEndVid = row['TEndVid'] || '';
    const tStartAnalyst = row['TStartAnalyst'] || '';
    const tEndAnalyst = row['TEndAnalyst'] || '';

    // Skip rows with missing required fields
    if (!method || !tStartVid || !tEndVid || !tStartAnalyst || !tEndAnalyst) continue;

    units.push({
      playMethod: method as PlayMethod,
      tStartVid: timecodeToSeconds(tStartVid),
      tEndVid: timecodeToSeconds(tEndVid),
      tStartAnalyst: timecodeToSeconds(tStartAnalyst),
      tEndAnalyst: timecodeToSeconds(tEndAnalyst),
      analyst: (row['Analysts'] || '').trim(),
      unitName: (row['Units'] || '').trim(),
    });
  }

  return units;
}

export async function loadCSVFromPath(path: string): Promise<Unit[]> {
  const url = /^(https?:)?\/\//.test(path)
    ? path
    : import.meta.env.BASE_URL + path.replace(/^\//, '');
  const response = await fetch(url);
  const text = await response.text();
  return parseCSV(text);
}
