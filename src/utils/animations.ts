/**
 * Easing functions para animações suaves
 */
export type EasingFunction = (t: number) => number;

export const easing = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

/**
 * Interpola entre dois valores usando uma função de easing
 */
export function interpolate(
  start: number,
  end: number,
  progress: number,
  easingFn: EasingFunction = easing.easeInOut
): number {
  const eased = easingFn(progress);
  return start + (end - start) * eased;
}

/**
 * Interpola entre duas cores RGB
 */
export function interpolateColor(
  startColor: string,
  endColor: string,
  progress: number,
  easingFn: EasingFunction = easing.easeInOut
): string {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  if (!start || !end) return startColor;
  
  const r = Math.round(interpolate(start.r, end.r, progress, easingFn));
  const g = Math.round(interpolate(start.g, end.g, progress, easingFn));
  const b = Math.round(interpolate(start.b, end.b, progress, easingFn));
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Cria uma animação de fade
 */
export function fade(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

/**
 * Cria uma animação de slide
 */
export function slide(progress: number, distance: number): number {
  return interpolate(-distance, 0, progress, easing.easeOut);
}

/**
 * Cria uma animação de scale
 */
export function scale(progress: number, startScale: number = 0.8): number {
  return interpolate(startScale, 1, progress, easing.easeOut);
}

