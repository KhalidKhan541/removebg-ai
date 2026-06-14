import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import {
  Layers,
  Circle,
  Square,
  Palette,
  Droplets,
  Upload,
} from "lucide-react";
import { useEditorStore, type BackgroundType } from "../../stores/editor-store";

const bgOptions: { type: BackgroundType; icon: typeof Layers; label: string }[] = [
  { type: "transparent", icon: Layers, label: "Transparent" },
  { type: "white", icon: Circle, label: "White" },
  { type: "black", icon: Square, label: "Black" },
  { type: "color", icon: Palette, label: "Color" },
  { type: "blur", icon: Droplets, label: "Blur" },
];

export default function BackgroundOptions() {
  const backgroundType = useEditorStore((s) => s.backgroundType);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const blurAmount = useEditorStore((s) => s.blurAmount);
  const setBackgroundType = useEditorStore((s) => s.setBackgroundType);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);
  const setBlurAmount = useEditorStore((s) => s.setBlurAmount);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
        Background
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {bgOptions.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => {
              setBackgroundType(type);
              if (type === "color") setShowPicker(true);
            }}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium
              transition-all duration-200
              ${
                backgroundType === type
                  ? "bg-brand-600/20 text-brand-400 ring-1 ring-brand-500/50"
                  : "bg-surface-800/50 text-surface-400 hover:bg-surface-800 hover:text-surface-200"
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {backgroundType === "color" && (
        <div className="animate-in space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border-2 border-surface-600 cursor-pointer shadow-lg"
              style={{ backgroundColor }}
              onClick={() => setShowPicker(!showPicker)}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-sm font-mono text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
          {showPicker && (
            <div className="flex justify-center">
              <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
            </div>
          )}
        </div>
      )}

      {backgroundType === "blur" && (
        <div className="animate-in space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-400">Blur intensity</span>
            <span className="text-sm font-medium text-brand-400">{blurAmount}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={blurAmount}
            onChange={(e) => setBlurAmount(Number(e.target.value))}
            className="w-full h-2 bg-surface-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-brand-400/50"
          />
        </div>
      )}
    </div>
  );
}
