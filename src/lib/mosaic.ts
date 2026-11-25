/** Pure mixing math for the mosaic: grid, quadrant face indices, cursor → velocity. */
export const GRID = 5;
/** Quadrant order: 0 top, 1 right, 2 bottom, 3 left (diagonal triangles of each cell). */
export type Positions = [number, number, number, number];

export function faceIndex(quadrant: number, cell: number, pos: number, n: number): number {
  if (n <= 0) return 0;
  const base = Math.floor(pos) + cell * 7 + quadrant * 11;
  return ((base % n) + n) % n;
}

const BASE = 0.15;

/** cx, cy in [-1, 1]. Moving toward a quadrant speeds it up; away reverses it. */
export function targetVelocities(cx: number, cy: number, reduced: boolean): Positions {
  const k = reduced ? 0.4 : 2.4;
  return [BASE - k * cy, BASE + k * cx, BASE + k * cy, BASE - k * cx];
}

export function idleVelocities(t: number, reduced: boolean): Positions {
  if (reduced) return [0, 0, 0, 0];
  return [
    0.3 + 0.15 * Math.sin(t * 0.4),
    -0.25 + 0.15 * Math.sin(t * 0.33 + 1),
    0.35 + 0.15 * Math.sin(t * 0.27 + 2),
    -0.2 + 0.15 * Math.sin(t * 0.37 + 3),
  ];
}
