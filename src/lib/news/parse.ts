import type { NewsArticle } from "@/lib/news/types";

function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
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
    if (slug === "nfl") return "NFL";
    if (slug === "nba") return "NBA";
    if (slug === "mlb") return "MLB";
    if (slug === "college") return "College";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  } catch {
    return "Sports";
  }
}

const SOCCER_PATTERN =
  /soccer|football|premier league|la liga|champions league|mls|transfer|messi|ronaldo|manchester|liverpool|arsenal|chelsea|barcelona|real madrid/i;

export function isSoccerArticle(article: Pick<NewsArticle, "title" | "description" | "link">) {
  return (
    article.link.includes("/soccer/") ||
    SOCCER_PATTERN.test(`${article.title} ${article.description}`)
  );
}

export function parseSiFeed(
  xml: string,
  options?: { soccerOnly?: boolean; limit?: number },
): NewsArticle[] {
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
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
