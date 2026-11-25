import type { Face } from "./faces";

const DB = "rehumanator";
const STORE = "faces";

function openDb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((res, rej) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      }),
  );
}

export async function listUserFaces(): Promise<Face[]> {
  if (typeof indexedDB === "undefined") return [];
  return tx<Face[]>("readonly", (s) => s.getAll() as IDBRequest<Face[]>);
}

export async function addUserFace(image: string): Promise<Face> {
  const face: Face = { id: crypto.randomUUID(), image, source: "user" };
  await tx("readwrite", (s) => s.put(face));
  return face;
}

export async function clearUserFaces(): Promise<void> {
  await tx("readwrite", (s) => s.clear());
}

/** Center-crop to a square headshot that roughly matches the synthetic framing. */
export function squareCrop(src: CanvasImageSource, w: number, h: number, mirror: boolean): string {
  const side = Math.min(w, h) * 0.8;
  const sx = (w - side) / 2;
  const sy = Math.max(0, Math.min(h - side, h * 0.46 - side / 2));
  const c = document.createElement("canvas");
  c.width = c.height = 320;
  const ctx = c.getContext("2d")!;
  if (mirror) {
    ctx.translate(320, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, sx, sy, side, side, 0, 0, 320, 320);
  return c.toDataURL("image/webp", 0.82);
}
