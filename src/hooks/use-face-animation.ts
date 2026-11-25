import type { CSSProperties } from "react";
import type { Face } from "@/lib/faces";

/** Extension point: future breathing / blinking / morphing. Returns no-op style today. */
export function useFaceAnimation(_face: Face | null): { style: CSSProperties; enabled: boolean } {
  return { style: {}, enabled: false };
}
