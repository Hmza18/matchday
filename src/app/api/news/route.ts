import { NextResponse } from "next/server";
import { parseSiFeed } from "@/lib/news/parse";

const FEED_URL = "https://www.si.com/feed";
const CACHE_SECONDS = 900;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter");
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit") ?? 20) || 20));

  try {
    const response = await fetch(FEED_URL, {
      next: { revalidate: CACHE_SECONDS },
      headers: { "User-Agent": "Matchday/1.0 (+https://matchday.app)" },
    });

    if (!response.ok) {
      throw new Error("Sports Illustrated feed is unavailable right now.");
    }

    const xml = await response.text();
    const articles = parseSiFeed(xml, {
      soccerOnly: filter === "soccer",
      limit,
    });

    return NextResponse.json({
      articles,
      source: "Sports Illustrated",
      sourceUrl: "https://www.si.com",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load news." },
      { status: 502 },
    );
  }
}
