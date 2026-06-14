import { useEffect, useState } from "react";
import { X, Trash2, Image as ImageIcon } from "lucide-react";
import { useEditorStore } from "../../stores/editor-store";
import {
  getHistory,
  deleteHistoryEntry,
  clearHistory,
  type HistoryEntry,
} from "../../hooks/useHistory";

export default function HistorySidebar() {
  const showHistory = useEditorStore((s) => s.showHistory);
  const toggleHistory = useEditorStore((s) => s.toggleHistory);
  const setOriginalImage = useEditorStore((s) => s.setOriginalImage);
  const setProcessedImage = useEditorStore((s) => s.setProcessedImage);

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getHistory();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory]);

  const handleSelect = async (entry: HistoryEntry) => {
    const origUrl = URL.createObjectURL(entry.originalBlob);
    const procUrl = URL.createObjectURL(entry.processedBlob);
    setOriginalImage(origUrl, entry.originalBlob as File, entry.fileName);
    setProcessedImage(procUrl);
    toggleHistory();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteHistoryEntry(id);
    setEntries((prev) => prev.filter((x) => x.id !== id));
  };

  const handleClear = async () => {
    await clearHistory();
    setEntries([]);
  };

  if (!showHistory) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={toggleHistory}
      />

      <div className="relative w-full max-w-sm bg-surface-900 border-l border-white/10 shadow-2xl flex flex-col slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">History</h2>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-surface-400 hover:text-red-400 transition-colors px-2 py-1"
              >
                Clear all
              </button>
            )}
            <button
              onClick={toggleHistory}
              className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-surface-500 py-8">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-surface-500">
              <ImageIcon className="w-10 h-10" />
              <p className="text-sm">No history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleSelect(entry)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors group text-left"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-700 flex-shrink-0 checkerboard">
                    <img
                      src={URL.createObjectURL(entry.processedBlob)}
                      alt={entry.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">
                      {entry.fileName}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {new Date(entry.timestamp).toLocaleDateString()}{" "}
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                    className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
