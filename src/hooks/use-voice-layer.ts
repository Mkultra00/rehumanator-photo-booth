import type { Face } from "@/lib/faces";

/** Extension point: future narration per face (e.g. ElevenLabs). No-op today. */
export function useVoiceLayer(_face: Face | null) {
  return { available: false, speak: async (_text: string) => {} };
}
