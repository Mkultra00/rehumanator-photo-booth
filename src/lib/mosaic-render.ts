import { GRID, faceIndex, type Positions } from "./mosaic";

// Canvas cannot read Tailwind tokens; these mirror --cream / --ink in styles.css.
const PAPER = "#f4ead5";
const INK = "#3a2a1c";

const ready = (img: HTMLImageElement | undefined): img is HTMLImageElement =>
  !!img && img.complete && img.naturalWidth > 0;

function triangle(ctx: CanvasRenderingContext2D, q: number, x: number, y: number, s: number) {
  const c = [x + s / 2, y + s / 2] as const;
  const corners = [
    [[x, y], [x + s, y]],
    [[x + s, y], [x + s, y + s]],
    [[x + s, y + s], [x, y + s]],
    [[x, y + s], [x, y]],
  ][q]!;
  ctx.beginPath();
  ctx.moveTo(corners[0]![0]!, corners[0]![1]!);
  ctx.lineTo(corners[1]![0]!, corners[1]![1]!);
  ctx.lineTo(c[0], c[1]);
  ctx.closePath();
}

/** One composite face: four diagonal triangles, each sliding through its own faces. */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  imgs: HTMLImageElement[],
  x: number,
  y: number,
  s: number,
  cell: number,
  pos: Positions,
) {
  const n = imgs.length;
  for (let q = 0; q < 4; q++) {
    const p = pos[q] ?? 0;
    const frac = p - Math.floor(p);
    const a = imgs[faceIndex(q, cell, p, n)];
    const b = imgs[faceIndex(q, cell, p + 1, n)];
    const off = frac * s;
    ctx.save();
    triangle(ctx, q, x, y, s);
    ctx.clip();
    ctx.fillStyle = INK;
    ctx.fillRect(x, y, s, s);
    const vertical = q === 0 || q === 2;
    if (ready(a)) ctx.drawImage(a, vertical ? x : x - off, vertical ? y - off : y, s, s);
    if (ready(b)) ctx.drawImage(b, vertical ? x : x - off + s, vertical ? y - off + s : y, s, s);
    ctx.restore();
  }
}

export function drawMosaic(ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[], size: number, pos: Positions) {
  const gap = Math.max(2, size * 0.006);
  const s = (size - gap * (GRID + 1)) / GRID;
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, size, size);
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      drawCell(ctx, imgs, gap + c * (s + gap), gap + r * (s + gap), s, r * GRID + c, pos);
    }
  }
}

/** Classic 4-frame vertical strip: full mosaic + three close-up "family" faces. */
export function makeStrip(imgs: HTMLImageElement[], pos: Positions, mosaic: HTMLCanvasElement | null): string {
  const fw = 480, pad = 36, gap = 24, foot = 120;
  const W = fw + pad * 2;
  const H = pad + fw * 4 + gap * 3 + foot;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const cells = [12, 6, 18];
  for (let i = 0; i < 4; i++) {
    const y = pad + i * (fw + gap);
    ctx.save();
    ctx.filter = "sepia(0.35) contrast(1.06) saturate(0.9)";
    if (i === 0 && mosaic) ctx.drawImage(mosaic, pad, y, fw, fw);
    else drawCell(ctx, imgs, pad, y, fw, cells[i - 1]!, pos);
    ctx.restore();
    const g = ctx.createRadialGradient(pad + fw / 2, y + fw / 2, fw * 0.3, pad + fw / 2, y + fw / 2, fw * 0.75);
    g.addColorStop(0, "rgba(58,42,28,0)");
    g.addColorStop(1, "rgba(58,42,28,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(pad, y, fw, fw);
  }
  // film grain
  ctx.fillStyle = "rgba(58,42,28,0.06)";
  for (let i = 0; i < 4000; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.font = '34px Monoton, "Courier New", monospace';
  ctx.fillText("REHUMANATOR", W / 2, H - foot + 58);
  ctx.font = '18px "Courier Prime", "Courier New", monospace';
  ctx.fillText(`we are all one  ·  ${new Date().toLocaleDateString()}`, W / 2, H - foot + 92);
  return c.toDataURL("image/png");
}
