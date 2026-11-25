import { Download, Printer, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Props = { strip: string | null; onClose: () => void };

export function StripDialog({ strip, onClose }: Props) {
  return (
    <Dialog open={strip !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[95dvh] max-w-sm overflow-y-auto border-4 border-chrome bg-walnut p-5 text-cream">
        <DialogTitle className="text-center font-retro text-2xl tracking-wide text-secondary">
          Your family portrait
        </DialogTitle>
        <DialogDescription className="text-center text-sm text-cream/80">
          Faces that belong to no single category — only to all of us.
        </DialogDescription>
        <div className="overflow-hidden rounded-sm bg-ink p-2 pt-0">
          <div className="h-2 rounded-b-sm bg-ink" />
          {strip && (
            <div className="print-strip">
              <img src={strip} alt="Printed four-frame photo strip of mixed faces" className="strip-eject mx-auto w-48 shadow-2xl sm:w-56" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => window.print()} className="flex flex-col items-center gap-1 rounded-md bg-primary px-2 py-3 font-retro text-sm text-primary-foreground">
            <Printer className="h-5 w-5" /> Print
          </button>
          {strip && (
            <a href={strip} download="rehumanator-strip.png" className="flex flex-col items-center gap-1 rounded-md bg-secondary px-2 py-3 font-retro text-sm text-secondary-foreground">
              <Download className="h-5 w-5" /> Save
            </a>
          )}
          <button type="button" onClick={onClose} className="flex flex-col items-center gap-1 rounded-md bg-cream px-2 py-3 font-retro text-sm text-ink">
            <RotateCcw className="h-5 w-5" /> Mix again
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
