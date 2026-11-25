import { useEffect, useRef, type MutableRefObject } from "react";
import { drawMosaic } from "@/lib/mosaic-render";
import { idleVelocities, targetVelocities, type Positions } from "@/lib/mosaic";

export type MosaicApi = {
  getPositions: () => Positions;
  getCanvas: () => HTMLCanvasElement | null;
  getImages: () => HTMLImageElement[];
};

type Props = {
  urls: string[];
  frozen: boolean;
  onSnap: () => void;
  apiRef: MutableRefObject<MosaicApi | null>;
};

export function MosaicCanvas({ urls, frozen, onSnap, apiRef }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const pos = useRef<Positions>([0, 3, 6, 9]);
  const vel = useRef<Positions>([0, 0, 0, 0]);
  const pointer = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const down = useRef<{ x: number; y: number } | null>(null);
  const frozenRef = useRef(frozen);
  const size = useRef(0);
  frozenRef.current = frozen;

  useEffect(() => {
    const cache = new Map(imgs.current.map((i) => [i.src, i]));
    imgs.current = urls.map((u) => {
      const abs = new URL(u, window.location.href).href;
      const hit = cache.get(abs);
      if (hit) return hit;
      const i = new Image();
      i.decoding = "async";
      i.src = u;
      return i;
    });
  }, [urls]);

  useEffect(() => {
    apiRef.current = {
      getPositions: () => [...pos.current] as Positions,
      getCanvas: () => canvasRef.current,
      getImages: () => imgs.current,
    };
  }, [apiRef]);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ro = new ResizeObserver(() => {
      const s = Math.floor(Math.min(wrap.clientWidth, wrap.clientHeight));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size.current = s;
      canvas.width = s * dpr;
      canvas.height = s * dpr;
      canvas.style.width = `${s}px`;
      canvas.style.height = `${s}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(wrap);
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (!frozenRef.current) {
        const p = pointer.current;
        const tgt = p.active ? targetVelocities(p.x, p.y, reduced) : idleVelocities(t / 1000, reduced);
        const ease = Math.min(1, dt * 3);
        const v = vel.current.map((x, q) => x + ((tgt[q] ?? 0) - x) * ease) as Positions;
        vel.current = v;
        pos.current = pos.current.map((x, q) => x + (v[q] ?? 0) * dt) as Positions;
      }
      if (size.current) drawMosaic(ctx, imgs.current, size.current, pos.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const track = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = {
      active: true,
      x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)),
    };
  };

  return (
    <div ref={wrapRef} className="flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        role="button"
        tabIndex={0}
        aria-label="Face mixing mosaic. Move to mix, tap or press Enter to snap."
        className="cursor-crosshair touch-none rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-ring"
        onPointerMove={track}
        onPointerDown={(e) => {
          track(e);
          down.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          const d = down.current;
          down.current = null;
          if (e.pointerType !== "mouse") pointer.current.active = false;
          if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) onSnap();
        }}
        onPointerLeave={() => (pointer.current.active = false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSnap();
          }
        }}
      />
    </div>
  );
}
