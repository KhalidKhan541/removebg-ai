import { Shield, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-surface-400 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            <span>
              100% private — all processing happens in your browser. No images
              are uploaded to any server.
            </span>
          </div>

          <div className="flex items-center gap-4 text-surface-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>Zero-knowledge processing</span>
            </div>
            <span>•</span>
            <span>Open source</span>
            <span>•</span>
            <span>Free forever</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-center text-surface-600 text-xs">
          RemoveBG AI — AI-powered background removal. Built with{" "}
          <span className="gradient-text font-medium">@imgly/background-removal</span>
        </div>
      </div>
    </footer>
  );
}
