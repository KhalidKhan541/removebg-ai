import { useEffect } from "react";
import { Wand2, AlertCircle } from "lucide-react";
import { useEditorStore } from "../../stores/editor-store";
import { useBackgroundRemoval } from "../../hooks/useBackgroundRemoval";
import ComparisonSlider from "./ComparisonSlider";
import BackgroundOptions from "./BackgroundOptions";
import DownloadPanel from "./DownloadPanel";
import Progress from "../ui/Progress";
import Spinner from "../ui/Spinner";

export default function BackgroundEditor() {
  const originalImage = useEditorStore((s) => s.originalImage);
  const processedImage = useEditorStore((s) => s.processedImage);
  const isProcessing = useEditorStore((s) => s.isProcessing);
  const progress = useEditorStore((s) => s.progress);
  const progressMessage = useEditorStore((s) => s.progressMessage);
  const error = useEditorStore((s) => s.error);
  const fileName = useEditorStore((s) => s.fileName);

  const { removeBackground } = useBackgroundRemoval();

  useEffect(() => {
    if (originalImage && !processedImage && !isProcessing && !error) {
      removeBackground();
    }
  }, [originalImage]);

  if (!originalImage) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main viewport */}
        <div className="space-y-4">
          {processedImage ? (
            <ComparisonSlider />
          ) : (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden glass flex items-center justify-center">
              <img
                src={originalImage}
                alt={fileName}
                className="w-full h-full object-contain opacity-50"
              />

              {isProcessing && (
                <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <Spinner size="lg" />
                  <Progress
                    value={progress}
                    message={progressMessage}
                    className="w-64"
                  />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-400 text-sm text-center max-w-sm">{error}</p>
                  <button
                    onClick={removeBackground}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* File name badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-surface-800/50 text-surface-400 text-xs font-mono truncate max-w-[300px]">
              {fileName}
            </div>
            {processedImage && (
              <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium">
                Background removed
              </span>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {processedImage && (
            <>
              {/* Process again button */}
              <button
                onClick={removeBackground}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-surface-800/50 text-surface-300 font-medium
                  hover:bg-surface-800 hover:text-white transition-all duration-200
                  border border-surface-700"
              >
                <Wand2 className="w-4 h-4" />
                Reprocess
              </button>

              <div className="h-px bg-surface-800" />

              <BackgroundOptions />

              <div className="h-px bg-surface-800" />

              <DownloadPanel />
            </>
          )}

          {!processedImage && isProcessing && (
            <div className="glass rounded-2xl p-6 text-center space-y-3">
              <Spinner size="md" className="mx-auto" />
              <p className="text-surface-400 text-sm">Removing background...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
