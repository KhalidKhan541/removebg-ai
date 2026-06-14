import { useState, useEffect, useRef, useCallback } from "react";

interface StatsData {
  today: { date: string; count: number; avgProcessingTimeMs: number };
  allTime: { totalBgRemoves: number; totalEvents: number };
}

interface StatsCounterProps {
  refreshIntervalMs?: number;
  className?: string;
}

function useAnimatedNumber(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const startValRef = useRef(0);

  useEffect(() => {
    if (target === current) return;

    startValRef.current = current;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startValRef.current + (target - startValRef.current) * eased);
      setCurrent(value);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

export function StatsCounter({ refreshIntervalMs = 60000, className = "" }: StatsCounterProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data: StatsData = await res.json();
      setStats(data);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetchStats, refreshIntervalMs]);

  const todayCount = useAnimatedNumber(stats?.today.count ?? 0);
  const totalCount = useAnimatedNumber(stats?.allTime.totalBgRemoves ?? 0);

  if (error && !stats) {
    return null;
  }

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatNumber(todayCount)}
        </span>
        <span className="text-sm text-muted-foreground">today</span>
      </div>
      <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{formatNumber(totalCount)}</span>
        <span>backgrounds removed all time</span>
      </div>
      {stats?.today.avgProcessingTimeMs ? (
        <div className="text-xs text-muted-foreground mt-0.5">
          avg {stats.today.avgProcessingTimeMs}ms per image
        </div>
      ) : null}
    </div>
  );
}
