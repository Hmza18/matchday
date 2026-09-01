import type { NewsArticle, NewsFilter } from "@/src/lib/news-types";

const FEED_URL = "https://www.si.com/feed";

function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : "";
}

function extractThumbnail(itemXml: string) {
  const match = itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  return match?.[1] ?? null;
}

function categoryFromLink(link: string) {
  try {
    const parts = new URL(link).pathname.split("/").filter(Boolean);
    const slug = parts[0] ?? "sports";
    if (slug === "soccer") return "Soccer";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  } catch {
    return "Sports";
  }
}

const SOCCER_PATTERN =
  /soccer|football|premier league|la liga|champions league|mls|transfer|messi|ronaldo|manchester|liverpool|arsenal|chelsea|barcelona|real madrid/i;

function isSoccerArticle(article: Pick<NewsArticle, "title" | "description" | "link">) {
  return (
    article.link.includes("/soccer/") ||
    SOCCER_PATTERN.test(`${article.title} ${article.description}`)
  );
}

function parseSiFeed(xml: string, options?: { soccerOnly?: boolean; limit?: number }) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const articles: NewsArticle[] = [];

  for (const itemXml of items) {
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    if (!title || !link) continue;

    const description = extractTag(itemXml, "description");
    const author = extractTag(itemXml, "author") || "Sports Illustrated";
    const pubDate = extractTag(itemXml, "pubDate");
    const guid = extractTag(itemXml, "guid");
    const imageUrl = extractThumbnail(itemXml);

    const article: NewsArticle = {
      id: guid || link,
      title,
      link,
      description,
      author,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      imageUrl,
      category: categoryFromLink(link),
    };

    if (options?.soccerOnly && !isSoccerArticle(article)) continue;

    articles.push(article);
    if (options?.limit && articles.length >= options.limit) break;
  }

  return articles;
}

export function formatNewsDate(iso: string) {
  const date = new Date(iso);
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export async function fetchSiNews(filter: NewsFilter, limit = 20) {
  const response = await fetch(FEED_URL, {
    headers: { "User-Agent": "Matchday/1.0" },
  });
  if (!response.ok) {
    throw new Error("Sports Illustrated feed is unavailable right now.");
  }
  const xml = await response.text();
  return parseSiFeed(xml, { soccerOnly: filter === "soccer", limit });
}

export type { NewsArticle, NewsFilter };