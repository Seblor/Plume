import { writable, derived } from 'svelte/store';

export const IDsToShow = writable<string[]>([]);

export const scrollOnCursorChange = writable(false);

export const scrollX = writable(0);
export const allChartWidths = writable<Record<string, number>>({});
export const maxWidth = derived(allChartWidths, (maxWidths) => {
  return Math.max(...Object.values(maxWidths));
});
