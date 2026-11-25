export type Face = {
  id: string;
  image: string;
  source: "synthetic" | "user";
};

export const SYNTHETIC_COUNT = 48;

export const syntheticFaces: Face[] = Array.from({ length: SYNTHETIC_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: `f${n}`, image: `/faces/f${n}.webp`, source: "synthetic" };
});

/** User faces appear this many times in the pool so guests see themselves often. */
export const USER_FACE_WEIGHT = 3;

export function buildPool(user: Face[]): string[] {
  return [
    ...syntheticFaces.map((f) => f.image),
    ...user.flatMap((f) => Array.from({ length: USER_FACE_WEIGHT }, () => f.image)),
  ];
}
