export interface Env {
  ANALYTICS_KV: KVNamespace;
  RATE_LIMIT_KV: KVNamespace;
}

interface TrackEvent {
  event: "bg_remove" | "image_upload" | "download" | "model_load";
  timestamp: string;
  processingTimeMs?: number;
  imageDimensions?: { width: number; height: number };
  modelUsed?: string;
  clientId?: string;
}

interface DailyAggregate {
  count: number;
  totalProcessingTimeMs: number;
  avgTime: number;
  totalProcessed: number;
  lastUpdated: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function isValidEvent(body: unknown): body is TrackEvent {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const validEvents = ["bg_remove", "image_upload", "download", "model_load"];
  return validEvents.includes(b.event as string);
}

function getTodayKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `daily:${yyyy}-${mm}-${dd}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();

    if (!isValidEvent(body)) {
      return new Response(JSON.stringify({ error: "Invalid event payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const record: TrackEvent = {
      event: body.event,
      timestamp: new Date().toISOString(),
      processingTimeMs: typeof body.processingTimeMs === "number" ? Math.round(body.processingTimeMs) : undefined,
      imageDimensions: body.imageDimensions,
      modelUsed: body.modelUsed,
      clientId: body.clientId,
    };

    const eventKey = `event:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    await context.env.ANALYTICS_KV.put(eventKey, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 7,
    });

    const dailyKey = getTodayKey();
    const existing = await context.env.ANALYTICS_KV.get<DailyAggregate>(dailyKey, {
      type: "json",
    });

    const now = new Date().toISOString();
    const processingTime = record.processingTimeMs ?? 0;

    let aggregate: DailyAggregate;
    if (existing) {
      const newCount = existing.count + 1;
      const newTotalTime = existing.totalProcessingTimeMs + processingTime;
      aggregate = {
        count: newCount,
        totalProcessingTimeMs: newTotalTime,
        avgTime: Math.round(newTotalTime / newCount),
        totalProcessed: existing.totalProcessed + (record.event === "bg_remove" ? 1 : 0),
        lastUpdated: now,
      };
    } else {
      aggregate = {
        count: 1,
        totalProcessingTimeMs: processingTime,
        avgTime: processingTime,
        totalProcessed: record.event === "bg_remove" ? 1 : 0,
        lastUpdated: now,
      };
    }

    await context.env.ANALYTICS_KV.put(dailyKey, JSON.stringify(aggregate), {
      expirationTtl: 60 * 60 * 24 * 90,
    });

    const totalKey = "total:all";
    const totalExisting = await context.env.ANALYTICS_KV.get<{ totalBgRemoves: number; totalEvents: number }>(
      totalKey,
      { type: "json" }
    );

    const total = {
      totalBgRemoves: (totalExisting?.totalBgRemoves ?? 0) + (record.event === "bg_remove" ? 1 : 0),
      totalEvents: (totalExisting?.totalEvents ?? 0) + 1,
    };
    await context.env.ANALYTICS_KV.put(totalKey, JSON.stringify(total));

    return new Response(JSON.stringify({ success: true, dailyCount: aggregate.count }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("Track error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};
