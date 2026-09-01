"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNewsDate } from "@/lib/news/parse";
import type { NewsArticle, NewsFilter } from "@/lib/news/types";

const FILTERS: { id: NewsFilter; label: string }[] = [
  { id: "soccer", label: "Soccer" },
  { id: "all", label: "All sports" },
];

function SiMark() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-md-line/80 bg-md-paper px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-md-muted uppercase">
      <span className="size-1.5 rounded-full bg-md-danger" />
      SI.com
    </span>
  );
}

function ArticleCard({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
}) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`md-card-premium group block overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,.1)] ${
        featured ? "md-featured-card" : ""
      }`}
    >
      {article.imageUrl ? (
        <div className={`relative overflow-hidden ${featured ? "h-[168px]" : "h-[132px]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/75 via-[#0f172a]/15 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-[#f8f8f8]/92 px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-md-ink-deep uppercase backdrop-blur-sm">
              {article.category}
            </span>
          </div>
        </div>
      ) : null}
      <div className={`${article.imageUrl ? "p-4" : "p-4 pt-4"} ${featured ? "pb-5" : ""}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          {!article.imageUrl ? (
            <span className="rounded-full bg-md-mint-soft px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-md-green-deep uppercase">
              {article.category}
            </span>
          ) : (
            <span />
          )}
          <span className="text-[11px] font-medium text-md-muted">
            {formatNewsDate(article.publishedAt)}
          </span>
        </div>
        <h3
          className={`font-headline font-semibold tracking-[0.02em] text-md-ink-deep group-hover:text-md-green-deep ${
            featured ? "text-[19px] leading-[1.2]" : "text-[16px] leading-[1.25]"
          }`}
        >
          {article.title}
        </h3>
        {article.description ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-md-muted">
            {article.description}
          </p>
        ) : null}
        <p className="mt-3 text-[11.5px] font-semibold text-md-green">Read on SI.com →</p>
      </div>
    </a>
  );
}

export function NewsScreen() {
  const [filter, setFilter] = useState<NewsFilter>("soccer");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (nextFilter: NewsFilter) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/news?filter=${nextFilter}&limit=20`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        error?: string;
        articles?: NewsArticle[];
      };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load news.");
      }
      setArticles(payload.articles ?? []);
    } catch (err) {
      setArticles([]);
      setError(err instanceof Error ? err.message : "Failed to load news.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNews(filter);
  }, [filter, loadNews]);

  const [featured, ...rest] = articles;

  return (
    <div className="md-fade">
      <div className="md-premium-banner mb-4 flex items-start justify-between gap-3 px-4 py-3.5">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] text-md-gold uppercase">
            Matchday wire
          </p>
          <p className="mt-1 text-[13px] leading-[1.5] text-md-ink">
            Headlines from Sports Illustrated, curated for football fans.
          </p>
        </div>
        <SiMark />
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((item) => {
          const on = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`h-9 rounded-full px-4 text-[12.5px] font-semibold transition ${
                on
                  ? "bg-md-green text-[#f8f8f8] shadow-[0_6px_16px_rgba(20,108,67,.22)]"
                  : "border border-md-line bg-md-paper text-md-muted hover:border-md-green/40 hover:text-md-green-deep"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-3.5">
          <div className="md-shimmer h-[220px] rounded-[16px]" />
          {[1, 2, 3].map((key) => (
            <div key={key} className="md-shimmer h-[120px] rounded-[16px]" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="md-card-premium rounded-[16px] p-5">
          <h2 className="font-headline text-[18px] font-semibold text-md-ink-deep">
            Couldn&apos;t load headlines
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-md-muted">{error}</p>
          <button
            type="button"
            onClick={() => {
              void loadNews(filter);
            }}
            className="mt-4 h-10 rounded-full bg-md-green px-4 text-sm font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && articles.length === 0 ? (
        <div className="md-card-premium rounded-[16px] p-5 text-center">
          <p className="font-headline text-[18px] font-semibold">No stories right now</p>
          <p className="mt-2 text-[13px] text-md-muted">
            Try switching to all sports while SI.com refreshes its soccer feed.
          </p>
        </div>
      ) : null}

      {!loading && !error && featured ? (
        <div className="grid gap-3.5">
          <ArticleCard article={featured} featured />
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}

      {!loading && !error && articles.length > 0 ? (
        <p className="mt-5 text-center text-[11px] text-md-muted">
          Stories open on{" "}
          <a
            href="https://www.si.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold"
          >
            si.com
          </a>
          . Matchday does not host article content.
        </p>
      ) : null}
    </div>
  );
}
