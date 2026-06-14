export interface Env {
  ANALYTICS_KV: KVNamespace;
}

interface HistoryEntry {
  id: string;
  event: "bg_remove" | "image_upload" | "download" | "model_load";
  timestamp: string;
  imageWidth?: number;
  imageHeight?: number;
  modelUsed?: string;
  processingTimeMs?: number;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getClientId(request: Request): string {
  const header = request.headers.get("X-Client-ID");
  if (header) return header;
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const clientId = url.searchParams.get("clientId") || getClientId(context.request);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

    const listResult = await context.env.ANALYTICS_KV.list<HistoryEntry>({
      prefix: `history:${clientId}:`,
      limit: limit,
    });

    const entries: HistoryEntry[] = [];
    if (listResult.keys.length > 0) {
      const values = await Promise.all(
        listResult.keys.map((key) =>
          context.env.ANALYTICS_KV.get<HistoryEntry>(key.name, { type: "json" })
        )
      );
      for (const v of values) {
        if (v) entries.push(v);
      }
    }

    return new Response(
      JSON.stringify({ clientId, entries, count: entries.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  } catch (err) {
    console.error("History GET error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json<{
      event: string;
      imageWidth?: number;
      imageHeight?: number;
      modelUsed?: string;
      processingTimeMs?: number;
      clientId?: string;
    }>();

    if (!body?.event) {
      return new Response(JSON.stringify({ error: "Missing event field" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    const clientId = body.clientId || getClientId(context.request);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const entry: HistoryEntry = {
      id,
      event: body.event as HistoryEntry["event"],
      timestamp: new Date().toISOString(),
      imageWidth: body.imageWidth,
      imageHeight: body.imageHeight,
      modelUsed: body.modelUsed,
      processingTimeMs: body.processingTimeMs,
    };

    const key = `history:${clientId}:${id}`;
    await context.env.ANALYTICS_KV.put(key, JSON.stringify(entry), {
      expirationTtl: 60 * 60 * 24 * 30,
    });

    return new Response(JSON.stringify({ success: true, entry }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("History POST error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};
