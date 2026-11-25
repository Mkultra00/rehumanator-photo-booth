import { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { addUserFace, squareCrop } from "@/lib/face-store";
import type { Face } from "@/lib/faces";

type Props = { open: boolean; onOpenChange: (o: boolean) => void; onAdded: (f: Face) => void };

export function AddFaceDialog({ open, onOpenChange, onAdded }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    setCamError(null);
    setLive(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("No camera here — upload a photo instead.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: 720, height: 720 } })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          void v.play();
          setLive(true);
        }
      })
      .catch(() => setCamError("Camera unavailable — upload a photo instead."));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open]);

  const save = async (image: string) => {
    const face = await addUserFace(image);
    onAdded(face);
    toast.success("You're in the mix!");
    onOpenChange(false);
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    void save(squareCrop(v, v.videoWidth, v.videoHeight, true));
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file);
      await save(squareCrop(bmp, bmp.width, bmp.height, false));
    } catch {
      toast.error("Couldn't read that image. Try a JPG or PNG.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-4 border-chrome bg-walnut p-5 text-cream">
        <DialogTitle className="text-center font-retro text-2xl text-secondary">Add your face</DialogTitle>
        <DialogDescription className="text-center text-sm text-cream/80">
          Center your face in the oval. Stays on this device only.
        </DialogDescription>
        <div className="relative aspect-square overflow-hidden rounded-md bg-ink">
          <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
          {live && (
            <div className="pointer-events-none absolute left-1/2 top-[46%] h-[62%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-secondary" />
          )}
          {camError && (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-cream/80">{camError}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" disabled={!live} onClick={capture} className="snap-button flex items-center justify-center gap-2 rounded-md bg-primary py-3 font-retro text-primary-foreground disabled:opacity-40">
            <Camera className="h-5 w-5" /> Snap
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-md bg-cream py-3 font-retro text-ink">
            <Upload className="h-5 w-5" /> Upload
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
      </DialogContent>
    </Dialog>
  );
}
