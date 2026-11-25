import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserPlus, Volume2, VolumeX } from "lucide-react";
import { MosaicCanvas, type MosaicApi } from "./MosaicCanvas";
import { StripDialog } from "./StripDialog";
import { AddFaceDialog } from "./AddFaceDialog";
import { buildPool, syntheticFaces, type Face } from "@/lib/faces";
import { listUserFaces } from "@/lib/face-store";
import { makeStrip } from "@/lib/mosaic-render";
import { emit } from "@/lib/booth-events";
import { playShutter, playWhirr } from "@/lib/sfx";
import { CatgirlBooth } from "@/components/catgirl/CatgirlBooth";

export function Booth() {
  const [userFaces, setUserFaces] = useState<Face[]>([]);
  const [frozen, setFrozen] = useState(false);
  const [strip, setStrip] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<"mosaic" | "catgirl">("mosaic");
  const api = useRef<MosaicApi | null>(null);

  useEffect(() => {
    listUserFaces().then(setUserFaces).catch(() => {});
  }, []);

  const urls = useMemo(() => buildPool(userFaces), [userFaces]);

  const snap = useCallback(() => {
    const a = api.current;
    if (frozen || !a) return;
    setFrozen(true);
    setFlash((f) => f + 1);
    if (!muted) playShutter();
    const positions = a.getPositions();
    emit("mosaicFrozen", { positions });
    window.setTimeout(() => {
      const dataUrl = makeStrip(a.getImages(), positions, a.getCanvas());
      setStrip(dataUrl);
      if (!muted) playWhirr();
      emit("stripPrinted", { dataUrl });
    }, 500);
  }, [frozen, muted]);

  return (
    <main className="wood-grain flex min-h-dvh items-center justify-center p-2 sm:p-6">
      <div className="cabinet flex w-full max-w-[min(94vw,680px,calc(100dvh-230px))] flex-col gap-3 rounded-[1.75rem] p-3 sm:gap-4 sm:p-5">
        <header className="chrome flex items-center justify-between rounded-2xl px-4 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2">
            <span className="rec-light h-3 w-3 rounded-full" aria-hidden />
            <span className="font-retro text-xs tracking-[0.25em] text-ink">{frozen ? "SNAP!" : "REC"}</span>
          </div>
          <h1 className="marquee font-display text-xl text-ink sm:text-4xl">ReHumanator</h1>
          <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="rounded-full p-1 text-ink">
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </header>

        <div role="tablist" className="grid grid-cols-2 gap-2">
          <button type="button" role="tab" aria-selected={mode === "mosaic"} onClick={() => setMode("mosaic")} className={`rounded-xl px-3 py-3 font-retro text-sm tracking-widest ${mode === "mosaic" ? "bg-primary text-primary-foreground" : "bg-cream text-ink"}`}>MOSAIC</button>
          <button type="button" role="tab" aria-selected={mode === "catgirl"} onClick={() => setMode("catgirl")} className={`rounded-xl px-3 py-3 font-retro text-sm tracking-widest ${mode === "catgirl" ? "bg-catpink text-ink" : "bg-cream text-ink"}`}>CLASSIC + CATGIRL</button>
        </div>

        {mode === "mosaic" ? (
          <>
        <div className="chrome relative rounded-2xl p-2 sm:p-3">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-ink">
            <MosaicCanvas urls={urls} frozen={frozen} onSnap={snap} apiRef={api} />
            {flash > 0 && <div key={flash} className="flash pointer-events-none absolute inset-0 bg-cream" />}
          </div>
        </div>

        <p className="text-center text-sm text-ink sm:text-base">
          Move across the faces to mix them · tap to snap your strip
        </p>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setAddOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-walnut px-3 py-4 font-retro text-cream">
            <UserPlus className="h-5 w-5" /> Add your face
          </button>
          <button type="button" onClick={snap} disabled={frozen} className="snap-button flex-1 rounded-xl bg-primary px-3 py-4 font-retro text-xl tracking-widest text-primary-foreground disabled:opacity-60">
            SNAP
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {syntheticFaces.length} synthetic faces{userFaces.length ? ` + ${userFaces.length} of you` : ""} · we are all one
        </p>
          </>
        ) : (
          <CatgirlBooth />
        )}
        <div className="mx-auto h-2 w-2/3 rounded-full bg-ink" aria-hidden title="print slot" />
      </div>

      <StripDialog strip={strip} onClose={() => { setStrip(null); setFrozen(false); }} />
      <AddFaceDialog open={addOpen} onOpenChange={setAddOpen} onAdded={(f) => setUserFaces((u) => [...u, f])} />
    </main>
  );
}
