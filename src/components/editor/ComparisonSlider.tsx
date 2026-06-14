import { useCallback, useRef, useState, useEffect } from "react";
import { useEditorStore } from "../../stores/editor-store";

export default function ComparisonSlider() {
  const originalImage = useEditorStore((s) => s.originalImage);
  const processedImage = useEditorStore((s) => s.processedImage);
  const comparisonPosition = useEditorStore((s) => s.comparisonPosition);
  const setComparisonPosition = useEditorStore((s) => s.setComparisonPosition);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setComparisonPosition(pct);
    },
    [setComparisonPosition]
  );

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  }, [updatePosition]);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, updatePosition]);

  if (!originalImage || !processedImage) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-ew-resize select-none glass"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Processed (full background) */}
      <div className="absolute inset-0">
        <img
          src={processedImage}
          alt="Background removed"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Original (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${comparisonPosition}%` }}
      >
        <img
          src={originalImage}
          alt="Original"
          className="w-full h-full object-contain"
          style={{ width: `${containerRef.current?.offsetWidth || 1000}px`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${comparisonPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl border-2 border-white/50">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L2 8L5 13" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 3L14 8L11 13" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium text-white z-10">
        Original
      </div>
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-brand-600/80 backdrop-blur-sm text-xs font-medium text-white z-10">
        Removed
      </div>
    </div>
  );
}
