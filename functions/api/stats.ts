export interface Env {
  ANALYTICS_KV: KVNamespace;
}

interface DailyAggregate {
  count: number;
  totalProcessingTimeMs: number;
  avgTime: number;
  totalProcessed: number;
  lastUpdated: string;
}

interface TotalStats {
  totalBgRemoves: number;
  totalEvents: number;
}

interface StatsResponse {
  today: {
    date: string;
    count: number;
    avgProcessingTimeMs: number;
  };
  allTime: {
    totalBgRemoves: number;
    totalEvents: number;
  };
  cached: boolean;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
  "CDN-Cache-Control": "public, max-age=60",
};

function getTodayKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `daily:${yyyy}-${mm}-${dd}`;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const dailyKey = getTodayKey();
    const [dailyData, totalData] = await Promise.all([
      context.env.ANALYTICS_KV.get<DailyAggregate>(dailyKey, { type: "json" }),
      context.env.ANALYTICS_KV.get<TotalStats>("total:all", { type: "json" }),
    ]);

    const response: StatsResponse = {
      today: {
        date: getTodayDateString(),
        count: dailyData?.count ?? 0,
        avgProcessingTimeMs: dailyData?.avgTime ?? 0,
      },
      allTime: {
        totalBgRemoves: totalData?.totalBgRemoves ?? 0,
        totalEvents: totalData?.totalEvents ?? 0,
      },
      cached: false,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (err) {
    console.error("Stats error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};
