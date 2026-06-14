interface ProgressProps {
  value: number;
  message?: string;
  className?: string;
}

export default function Progress({ value, message, className = "" }: ProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      {message && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-surface-300">{message}</span>
          <span className="text-sm font-medium text-brand-400">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${value}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse-slow" />
        </div>
      </div>
    </div>
  );
}
