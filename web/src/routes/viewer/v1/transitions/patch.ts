import { crossfade } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

export function patchAdd(node: Element, { duration = 250 }: { duration?: number } | undefined = {}) {
  return {
    duration,
    css: (t: number, u: number) => {
      return `
        background-color: rgba(
          0,
          150,
          0,
          ${Math.min(100, u * 100)}%
        );`;
    }
  };
}

export function patchEdit(node: Element, { duration = 250 }: { duration?: number } | undefined = {}) {
  return {
    duration,
    css: (t: number, u: number) => {
      return `
        background-color: rgba(
          200,
          75,
          0,
          ${Math.min(100, u * 100)}%
        );`;
    }
  };
}

export function patchRemove(node: Element, { duration = 250 }: { duration?: number } | undefined = {}) {
  return {
    duration,
    css: (t: number, u: number) => {
      return `
        background-color: rgba(
          150,
          0,
          0,
          ${Math.min(100, u * 100)}%
        );`;
    }
  };
}

export const [send, receive] = crossfade({
	duration: (d) => Math.sqrt(d * 500),

	fallback() {
		return {
			duration: 1000,
			easing: quintOut,
		};
	}
});