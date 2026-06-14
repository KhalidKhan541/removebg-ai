import { useCallback, useRef } from "react";
import { useEditorStore } from "../stores/editor-store";
import { resizeImageIfNeeded } from "../lib/image-resize";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE_MB = 25;

export function useImageUpload() {
  const setOriginalImage = useEditorStore((s) => s.setOriginalImage);
  const setError = useEditorStore((s) => s.setError);
  const resetRef = useRef(useEditorStore.getState().reset);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported format. Use PNG, JPG, WebP, or GIF.");
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      try {
        const { url } = await resizeImageIfNeeded(file);
        setOriginalImage(url, file, file.name);
      } catch {
        setError("Failed to read the image file.");
      }
    },
    [setOriginalImage, setError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  return { handleDrop, handlePaste, handleFileInput, processFile };
}
