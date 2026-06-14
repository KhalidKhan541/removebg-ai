import { create } from "zustand";

export type BackgroundType = "transparent" | "white" | "black" | "color" | "blur";

interface EditorState {
  originalImage: string | null;
  processedImage: string | null;
  originalFile: File | null;
  fileName: string;
  isProcessing: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;
  backgroundType: BackgroundType;
  backgroundColor: string;
  blurAmount: number;
  outputFormat: "png" | "jpeg";
  outputQuality: number;
  showHistory: boolean;
  comparisonPosition: number;

  setOriginalImage: (src: string | null, file: File | null, name: string) => void;
  setProcessedImage: (src: string | null) => void;
  setIsProcessing: (v: boolean) => void;
  setProgress: (p: number, msg?: string) => void;
  setError: (e: string | null) => void;
  setBackgroundType: (t: BackgroundType) => void;
  setBackgroundColor: (c: string) => void;
  setBlurAmount: (a: number) => void;
  setOutputFormat: (f: "png" | "jpeg") => void;
  setOutputQuality: (q: number) => void;
  toggleHistory: () => void;
  setComparisonPosition: (p: number) => void;
  reset: () => void;
}

const initialState = {
  originalImage: null,
  processedImage: null,
  originalFile: null,
  fileName: "",
  isProcessing: false,
  progress: 0,
  progressMessage: "",
  error: null,
  backgroundType: "transparent" as BackgroundType,
  backgroundColor: "#a855f7",
  blurAmount: 10,
  outputFormat: "png" as "png" | "jpeg",
  outputQuality: 92,
  showHistory: false,
  comparisonPosition: 50,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setOriginalImage: (src, file, name) =>
    set({ originalImage: src, originalFile: file, fileName: name, processedImage: null, error: null }),

  setProcessedImage: (src) => set({ processedImage: src }),

  setIsProcessing: (v) => set({ isProcessing: v }),

  setProgress: (p, msg) => set({ progress: p, ...(msg !== undefined ? { progressMessage: msg } : {})}),

  setError: (e) => set({ error: e, isProcessing: false }),

  setBackgroundType: (t) => set({ backgroundType: t }),

  setBackgroundColor: (c) => set({ backgroundColor: c }),

  setBlurAmount: (a) => set({ blurAmount: a }),

  setOutputFormat: (f) => set({ outputFormat: f }),

  setOutputQuality: (q) => set({ outputQuality: q }),

  toggleHistory: () => set((s) => ({ showHistory: !s.showHistory })),

  setComparisonPosition: (p) => set({ comparisonPosition: p }),

  reset: () => set(initialState),
}));
