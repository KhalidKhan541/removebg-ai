import { useCallback } from "react";
import { Download, Image as ImageIcon } from "lucide-react";
import { useEditorStore } from "../../stores/editor-store";
import { compositeBackground } from "../../lib/canvas";
import { downloadBlob, getDownloadFilename } from "../../lib/download";

export default function DownloadPanel() {
  const originalImage = useEditorStore((s) => s.originalImage);
  const processedImage = useEditorStore((s) => s.processedImage);
  const fileName = useEditorStore((s) => s.fileName);
  const outputFormat = useEditorStore((s) => s.outputFormat);
  const outputQuality = useEditorStore((s) => s.outputQuality);
  const backgroundType = useEditorStore((s) => s.backgroundType);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const blurAmount = useEditorStore((s) => s.blurAmount);
  const setOutputFormat = useEditorStore((s) => s.setOutputFormat);
  const setOutputQuality = useEditorStore((s) => s.setOutputQuality);

  const handleDownload = useCallback(async () => {
    if (!processedImage || !originalImage) return;

    const fgImg = new Image();
    fgImg.src = processedImage;
    await new Promise((r) => (fgImg.onload = r));

    const origImg = new Image();
    origImg.src = originalImage;
    await new Promise((r) => (origImg.onload = r));

    const blob = await compositeBackground({
      foreground: fgImg,
      original: origImg,
      backgroundType,
      backgroundColor,
      blurAmount,
      width: fgImg.naturalWidth,
      height: fgImg.naturalHeight,
    });

    const outBlob =
      outputFormat === "jpeg"
        ? await new Promise<Blob>((resolve) => {
            const canvas = document.createElement("canvas");
            canvas.width = fgImg.naturalWidth;
            canvas.height = fgImg.naturalHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(fgImg, 0, 0);
            canvas.toBlob(
              (b) => resolve(b!),
              "image/jpeg",
              outputQuality / 100
            );
          })
        : blob;

    const name = getDownloadFilename(fileName || "image", outputFormat);
    downloadBlob(outBlob, name);
  }, [
    processedImage,
    originalImage,
    fileName,
    outputFormat,
    outputQuality,
    backgroundType,
    backgroundColor,
    blurAmount,
  ]);

  if (!processedImage) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
        Export
      </h3>

      <div className="flex gap-2">
        {(["png", "jpeg"] as const).map((fmt) => (
          <button
            key={fmt}
            onClick={() => setOutputFormat(fmt)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${
                outputFormat === fmt
                  ? "bg-brand-600/20 text-brand-400 ring-1 ring-brand-500/50"
                  : "bg-surface-800/50 text-surface-400 hover:bg-surface-800"
              }
            `}
          >
            <ImageIcon className="w-4 h-4" />
            {fmt.toUpperCase()}
          </button>
        ))}
      </div>

      {outputFormat === "jpeg" && (
        <div className="space-y-2 animate-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-400">Quality</span>
            <span className="text-sm font-medium text-brand-400">{outputQuality}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={outputQuality}
            onChange={(e) => setOutputQuality(Number(e.target.value))}
            className="w-full h-2 bg-surface-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-brand-400/50"
          />
        </div>
      )}

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
          bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold
          hover:from-brand-500 hover:to-brand-600 transition-all duration-200
          shadow-lg shadow-brand-600/25 active:scale-[0.98]"
      >
        <Download className="w-5 h-5" />
        Download {outputFormat.toUpperCase()}
      </button>
    </div>
  );
}
