import { Scissors, Sparkles, Menu, X, Clock, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../../stores/editor-store";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleHistory = useEditorStore((s) => s.toggleHistory);
  const reset = useEditorStore((s) => s.reset);
  const originalImage = useEditorStore((s) => s.originalImage);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center glow-brand">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Remove<span className="gradient-text">BG</span>{" "}
            <span className="text-surface-400 font-medium text-sm">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {originalImage && (
            <>
              <button
                onClick={toggleHistory}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Clock className="w-4 h-4" />
                History
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                New Image
              </button>
            </>
          )}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-600 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Free & Private
          </a>
        </nav>

        <button
          className="md:hidden p-2 text-surface-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
          {originalImage && (
            <>
              <button
                onClick={() => {
                  toggleHistory();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5"
              >
                <Clock className="w-4 h-4" />
                History
              </button>
              <button
                onClick={() => {
                  reset();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-white hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4" />
                New Image
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
