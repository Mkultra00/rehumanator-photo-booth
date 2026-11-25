import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw } from "lucide-react";
import { playShutter } from "@/lib/sfx";

const LINES = [
  "Nya~! Your photo is so cute today!",
  "Purrfect shot~! Nya nya!",
  "Kyaa~! You look absolutely adorable!",
  "Mew~ I want to frame this one forever!",
  "Nyaa~ best photo booth buddy ever!",
  "Hehe~ that smile is purr-ecious!",
];

export function CatgirlBooth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [live, setLive] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [talking, setTalking] = useState(false);
  const lastLine = useRef(-1);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  };
  useEffect(() => stop, []);

  const open = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This device has no camera access.");
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = s;
      setPhoto(null);
      setLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play();
        }
      });
    } catch {
      setError("Camera permission was denied. Allow it in your browser and try again.");
    }
  };

  const take = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const g = c.getContext("2d");
    if (!g) return;
    g.translate(c.width, 0);
    g.scale(-1, 1);
    g.drawImage(v, 0, 0);
    playShutter();
    setPhoto(c.toDataURL("image/jpeg", 0.92));
    stop();
  };

  const sayCute = () => {
    let i = Math.floor(Math.random() * LINES.length);
    if (i === lastLine.current) i = (i + 1) % LINES.length;
    lastLine.current = i;
    audioRef.current?.pause();
    const a = new Audio(`/catgirl/line${i + 1}.mp3`);
    audioRef.current = a;
    setBubble(LINES[i] ?? null);
    setTalking(true);
    a.onended = () => setTalking(false);
    a.play().catch(() => setTalking(false));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="chrome relative rounded-2xl p-2 sm:p-3">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-ink sm:aspect-square">
          {live && <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />}
          {photo && !live && <img src={photo} alt="Your snapshot" className="h-full w-full object-cover" />}
          {!live && !photo && (
            <div className="flex h-full items-center justify-center p-6 text-center font-retro text-cream">
              Your regular photo will appear here
            </div>
          )}
          {photo && !live && (
            <>
              <img
                src="/catgirl/catgirl.webp"
                alt="Anime cat girl"
                className={`catgirl pointer-events-none absolute -bottom-4 -right-6 h-[72%] drop-shadow-2xl ${talking ? "catgirl-talk" : ""}`}
              />
              {bubble && (
                <div className="absolute bottom-[62%] right-[30%] max-w-[55%] rounded-2xl border-4 border-catpink bg-cream px-3 py-2 font-retro text-sm text-ink shadow-lg sm:text-base">
                  {bubble}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {error && <p className="text-center text-sm text-primary">{error}</p>}

      {live ? (
        <button type="button" onClick={take} className="snap-button flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-5 font-retro text-xl tracking-widest text-primary-foreground">
          <Camera className="h-6 w-6" /> TAKE PHOTO
        </button>
      ) : (
        <button type="button" onClick={open} className="flex items-center justify-center gap-3 rounded-xl bg-walnut px-4 py-5 font-retro text-base leading-tight text-cream sm:text-lg">
          {photo ? <RotateCcw className="h-6 w-6 shrink-0" /> : <Camera className="h-7 w-7 shrink-0" />}
          OPEN BOOTH CAMERA - REGULAR SNAPSHOT (NO DISTORTION)
        </button>
      )}

      {photo && !live && (
        <>
          <button type="button" onClick={sayCute} className="rounded-xl bg-catpink px-4 py-5 font-retro text-xl tracking-wide text-ink shadow-lg active:scale-95">
            MAKE CATGIRL SAY CUTE THING
          </button>
          <p className="text-center text-[11px] text-muted-foreground">Voice powered by ElevenLabs</p>
        </>
      )}
    </div>
  );
}
