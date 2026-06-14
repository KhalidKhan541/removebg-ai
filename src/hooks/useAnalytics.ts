import { useCallback, useRef, useEffect } from "react";

type TrackingEvent = "bg_remove" | "image_upload" | "download" | "model_load";

interface TrackPayload {
  event: TrackingEvent;
  processingTimeMs?: number;
  imageDimensions?: { width: number; height: number };
  modelUsed?: string;
}

const DEBOUNCE_MS = 300;
const QUEUE_FLUSH_INTERVAL = 5000;

function getClientId(): string {
  if (typeof window === "undefined") return "server";
  const stored = localStorage.getItem("removebg_client_id");
  if (stored) return stored;
  const id = `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("removebg_client_id", id);
  return id;
}

export function useAnalytics() {
  const queueRef = useRef<TrackPayload[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimersRef = useRef<Map<TrackingEvent, ReturnType<typeof setTimeout>>>(new Map());
  const clientIdRef = useRef<string>("");

  useEffect(() => {
    clientIdRef.current = getClientId();
  }, []);

  const flushQueue = useCallback(async () => {
    const queue = queueRef.current;
    if (queue.length === 0) return;

    const items = [...queue];
    queueRef.current = [];

    for (const item of items) {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...item,
            clientId: clientIdRef.current,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        queue.push(item);
      }
    }
  }, []);

  useEffect(() => {
    flushTimerRef.current = setInterval(flushQueue, QUEUE_FLUSH_INTERVAL);
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, [flushQueue]);

  const trackEvent = useCallback(
    (payload: TrackPayload) => {
      const { event } = payload;

      const existing = debounceTimersRef.current.get(event);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        queueRef.current.push(payload);
        debounceTimersRef.current.delete(event);
      }, DEBOUNCE_MS);

      debounceTimersRef.current.set(event, timer);
    },
    []
  );

  const trackBgRemove = useCallback(
    (processingTimeMs: number, width: number, height: number, modelUsed?: string) => {
      trackEvent({
        event: "bg_remove",
        processingTimeMs,
        imageDimensions: { width, height },
        modelUsed,
      });
    },
    [trackEvent]
  );

  const trackUpload = useCallback(
    (width: number, height: number) => {
      trackEvent({
        event: "image_upload",
        imageDimensions: { width, height },
      });
    },
    [trackEvent]
  );

  const trackDownload = useCallback(() => {
    trackEvent({ event: "download" });
  }, [trackEvent]);

  const trackModelLoad = useCallback(
    (modelUsed: string) => {
      trackEvent({ event: "model_load", modelUsed });
    },
    [trackEvent]
  );

  useEffect(() => {
    return () => {
      for (const timer of debounceTimersRef.current.values()) {
        clearTimeout(timer);
      }
      flushQueue();
    };
  }, [flushQueue]);

  return { trackEvent, trackBgRemove, trackUpload, trackDownload, trackModelLoad };
}
