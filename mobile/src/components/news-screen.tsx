import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchSiNews, formatNewsDate } from "@/src/lib/news";
import type { NewsArticle, NewsFilter } from "@/src/lib/news-types";
import { colors, fonts, radius, shadows, spacing } from "@/src/theme";

const FILTERS: { id: NewsFilter; label: string }[] = [
  { id: "soccer", label: "Soccer" },
  { id: "all", label: "All sports" },
];

function ArticleCard({
  article,
  featured = false,
}: {
  article: NewsArticle;
  featured?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        void Linking.openURL(article.link);
      }}
      style={[styles.card, featured && styles.cardFeatured]}
    >
      {article.imageUrl ? (
        <View style={[styles.imageWrap, featured && styles.imageFeatured]}>
          <Image source={{ uri: article.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageOverlay} />
          <Text style={styles.imageBadge}>{article.category}</Text>
        </View>
      ) : null}
      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          {!article.imageUrl ? <Text style={styles.category}>{article.category}</Text> : <View />}
          <Text style={styles.time}>{formatNewsDate(article.publishedAt)}</Text>
        </View>
        <Text style={[styles.title, featured && styles.titleFeatured]}>{article.title}</Text>
        {article.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {article.description}
          </Text>
        ) : null}
        <Text style={styles.cta}>Read on SI.com →</Text>
      </View>
    </Pressable>
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
      const nextArticles = await fetchSiNews(nextFilter, 20);
      setArticles(nextArticles);
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
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.banner}>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerKicker}>MATCHDAY WIRE</Text>
          <Text style={styles.bannerText}>
            Headlines from Sports Illustrated, curated for football fans.
          </Text>
        </View>
        <View style={styles.siBadge}>
          <View style={styles.siDot} />
          <Text style={styles.siText}>SI.com</Text>
        </View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const on = filter === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.filterChip, on && styles.filterChipOn]}
            >
              <Text style={[styles.filterText, on && styles.filterTextOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} />
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Couldn&apos;t load headlines</Text>
          <Text style={styles.emptyBody}>{error}</Text>
          <Pressable onPress={() => void loadNews(filter)} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && featured ? (
        <View style={styles.list}>
          <ArticleCard article={featured} featured />
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </View>
      ) : null}

      {!loading && !error && articles.length > 0 ? (
        <Text style={styles.footer}>Stories open on si.com. Matchday does not host article content.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  banner: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#E8D7A8",
    backgroundColor: colors.goldSoft,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    ...shadows.card,
  },
  bannerCopy: {
    flex: 1,
  },
  bannerKicker: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.warnDeep,
  },
  bannerText: {
    marginTop: 4,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  siBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  siDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.danger,
  },
  siText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.muted,
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipOn: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  filterText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12.5,
    color: colors.muted,
  },
  filterTextOn: {
    color: colors.light,
  },
  center: {
    paddingVertical: 40,
    alignItems: "center",
  },
  list: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    overflow: "hidden",
    ...shadows.card,
  },
  cardFeatured: {
    borderColor: "#E8D7A8",
    ...shadows.raised,
  },
  imageWrap: {
    height: 132,
    position: "relative",
  },
  imageFeatured: {
    height: 168,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.25)",
  },
  imageBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: radius.pill,
    backgroundColor: "rgba(248,248,248,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: colors.ink,
    overflow: "hidden",
  },
  cardBody: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  category: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.greenDeep,
    backgroundColor: colors.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  time: {
    fontFamily: fonts.sansMed,
    fontSize: 11,
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 16,
    lineHeight: 21,
    color: colors.ink,
  },
  titleFeatured: {
    fontSize: 19,
    lineHeight: 24,
  },
  description: {
    marginTop: 8,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  cta: {
    marginTop: 10,
    fontFamily: fonts.sansSemi,
    fontSize: 11.5,
    color: colors.green,
  },
  emptyCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    padding: spacing.xl,
    ...shadows.card,
  },
  emptyTitle: {
    fontFamily: fonts.headline,
    fontSize: 18,
    color: colors.ink,
  },
  emptyBody: {
    marginTop: 8,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  retryBtn: {
    marginTop: 16,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  retryText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.light,
  },
  footer: {
    textAlign: "center",
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
});
