import { describe, it, expect } from "vitest";
import { faceIndex, targetVelocities, GRID } from "@/lib/mosaic";
import { buildPool, SYNTHETIC_COUNT } from "@/lib/faces";

describe("mosaic", () => {
  it("is a 5x5 grid", () => expect(GRID).toBe(5));
  it("face index wraps for negative and large positions", () => {
    expect(faceIndex(0, 0, -1, 10)).toBe(9);
    expect(faceIndex(0, 0, 25, 10)).toBe(5);
  });
  it("the four quadrants of a cell show different faces", () => {
    const ids = [0, 1, 2, 3].map((q) => faceIndex(q, 12, 3.4, 48));
    expect(new Set(ids).size).toBe(4);
  });
  it("cursor to the right speeds the right quadrant and reverses the left", () => {
    const [, right, , left] = targetVelocities(1, 0, false);
    expect(right).toBeGreaterThan(1);
    expect(left).toBeLessThan(0);
  });
  it("user faces are weighted into the pool", () => {
    expect(buildPool([{ id: "u", image: "x", source: "user" }])).toHaveLength(SYNTHETIC_COUNT + 3);
  });
});
