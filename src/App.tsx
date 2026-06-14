import { useEffect } from "react";
import { useEditorStore } from "./stores/editor-store";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import DropZone from "./components/upload/DropZone";
import BackgroundEditor from "./components/editor/BackgroundEditor";
import HistorySidebar from "./components/history/HistorySidebar";

export default function App() {
  const originalImage = useEditorStore((s) => s.originalImage);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const store = useEditorStore.getState();
            const event = new Event("paste-handled");
            window.dispatchEvent(
              new CustomEvent("paste-file", { detail: file })
            );
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        {!originalImage ? (
          <div className="flex flex-col items-center gap-12 px-4">
            {/* Hero */}
            <div className="text-center max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                AI-Powered Background Removal
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Remove backgrounds
                <br />
                <span className="gradient-text">instantly & privately</span>
              </h1>

              <p className="text-lg text-surface-400 max-w-xl mx-auto">
                100% browser-based. Your images never leave your device.
                Powered by state-of-the-art AI.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-surface-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No uploads
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Works offline
                </div>
              </div>
            </div>

            <DropZone />

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
              {[
                {
                  title: "AI Precision",
                  desc: "State-of-the-art segmentation removes even hair and fine details.",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  ),
                },
                {
                  title: "100% Private",
                  desc: "Everything runs locally in your browser. Zero data sent to servers.",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  ),
                },
                {
                  title: "Custom Backgrounds",
                  desc: "Replace with colors, blur, or custom backgrounds instantly.",
                  icon: (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                    </svg>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="glass rounded-2xl p-6 space-y-3 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                    {card.icon}
                  </div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="text-sm text-surface-400">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <BackgroundEditor />
        )}
      </main>

      <Footer />
      <HistorySidebar />
    </div>
  );
}
