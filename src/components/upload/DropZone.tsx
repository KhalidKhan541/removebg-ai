import { useCallback, useState } from "react";
import { Upload, Image, Clipboard } from "lucide-react";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useEditorStore } from "../../stores/editor-store";
import Spinner from "../ui/Spinner";

export default function DropZone() {
  const { handleDrop, handlePaste, handleFileInput } = useImageUpload();
  const [isDragging, setIsDragging] = useState(false);
  const isProcessing = useEditorStore((s) => s.isProcessing);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onPaste={handlePaste}
      tabIndex={0}
      className={`
        relative w-full max-w-2xl mx-auto rounded-3xl p-12 md:p-16
        border-2 border-dashed transition-all duration-300 cursor-pointer
        focus:outline-none group
        ${
          isDragging
            ? "border-brand-500 bg-brand-500/10 scale-[1.02]"
            : "border-surface-600 hover:border-brand-500/50 hover:bg-white/[0.02]"
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      <div className="flex flex-col items-center gap-6 text-center pointer-events-none">
        {isProcessing ? (
          <Spinner size="lg" />
        ) : (
          <div
            className={`
              w-20 h-20 rounded-2xl flex items-center justify-center
              transition-all duration-300
              ${isDragging
                ? "bg-brand-500/20 scale-110"
                : "bg-surface-800 group-hover:bg-brand-500/10 group-hover:scale-105"
              }
            `}
          >
            {isDragging ? (
              <Image className="w-10 h-10 text-brand-400" />
            ) : (
              <Upload className="w-10 h-10 text-surface-400 group-hover:text-brand-400 transition-colors" />
            )}
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragging ? "Drop your image here" : "Drop an image or click to upload"}
          </h3>
          <p className="text-surface-400 text-sm">
            PNG, JPG, WebP or GIF — Max 25MB
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-surface-500">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/50">
            <Clipboard className="w-3 h-3" />
            Paste from clipboard
          </div>
          <span>or drag & drop</span>
        </div>
      </div>
    </div>
  );
}
