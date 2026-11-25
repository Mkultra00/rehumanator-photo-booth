import type { Positions } from "./mosaic";

type EventMap = {
  mosaicFrozen: { positions: Positions };
  stripPrinted: { dataUrl: string };
};
type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

const handlers: { [K in keyof EventMap]: Set<Handler<K>> } = {
  mosaicFrozen: new Set(),
  stripPrinted: new Set(),
};

export function emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
  handlers[event].forEach((h) => h(payload));
}

export function on<K extends keyof EventMap>(event: K, handler: Handler<K>): () => void {
  handlers[event].add(handler);
  return () => handlers[event].delete(handler);
}

export const onMosaicFrozen = (h: Handler<"mosaicFrozen">) => on("mosaicFrozen", h);
export const onStripPrinted = (h: Handler<"stripPrinted">) => on("stripPrinted", h);
