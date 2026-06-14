import { useCallback, useRef, useEffect } from "react";
import { useEditorStore } from "../stores/editor-store";
import { saveToHistory } from "./useHistory";

let workerInstance: Worker | null = null;

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL("../workers/bg-remove.worker.ts", import.meta.url),
      { type: "module" }
    );
  }
  return workerInstance;
}

export function useBackgroundRemoval() {
  const {
    originalImage,
    originalFile,
    fileName,
    setIsProcessing,
    setProgress,
    setProcessedImage,
    setError,
  } = useEditorStore();

  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (workerInstance) {
        workerInstance.terminate();
        workerInstance = null;
      }
    };
  }, []);

  const removeBackground = useCallback(async () => {
    if (!originalImage || !originalFile) return;

    const requestId = ++requestIdRef.current;
    const worker = getWorker();

    setIsProcessing(true);
    setProgress(0, "Preparing image...");
    setError(null);

    const responsePromise = new Promise<{ blob: Blob }>((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.id !== String(requestId)) return;

        if (e.data.type === "progress") {
          setProgress(e.data.progress, e.data.message);
        } else if (e.data.type === "done") {
          worker.removeEventListener("message", handler);
          resolve({ blob: e.data.blob });
        } else if (e.data.type === "error") {
          worker.removeEventListener("message", handler);
          reject(new Error(e.data.error));
        }
      };
      worker.addEventListener("message", handler);
    });

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = originalImage;
      });

      const bitmap = await createImageBitmap(img);

      worker.postMessage({
        type: "process",
        imageBitmap: bitmap,
        id: String(requestId),
      });

      const { blob } = await responsePromise;

      if (requestId !== requestIdRef.current) return;

      const url = URL.createObjectURL(blob);
      setProcessedImage(url);

      const processedFile = new File([blob], "processed.png", {
        type: "image/png",
      });

      try {
        await saveToHistory(originalFile, processedFile, fileName);
      } catch {
        // Silently fail history save
      }

      setIsProcessing(false);
      setProgress(100, "Done!");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        err instanceof Error ? err.message : "Background removal failed"
      );
    }
  }, [
    originalImage,
    originalFile,
    fileName,
    setIsProcessing,
    setProgress,
    setProcessedImage,
    setError,
  ]);

  return { removeBackground };
}
