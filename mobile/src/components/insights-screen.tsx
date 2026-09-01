import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LockIcon, SparkleIcon } from "@/src/components/icons";
import { ClubBadge } from "@/src/components/ui";
import { featuredFixture, insightsForFixture } from "@/src/lib/insights";
import { useMatchday } from "@/src/lib/store";
import { colors, fonts } from "@/src/theme";

export function InsightsScreen() {
  const { fixtures, gw } = useMatchday();

  const featured = useMemo(() => featuredFixture(fixtures), [fixtures]);
  const insights = useMemo(
    () => (featured ? insightsForFixture(featured) : null),
    [featured],
  );

  if (!insights) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No fixtures loaded for GW{gw} yet.</Text>
      </View>
    );
  }

  const { fixture, homeWinPct, drawPct, awayWinPct, expectedPoints, insight } = insights;

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.banner}>
        <SparkleIcon />
        <Text style={styles.bannerText}>
          Model data for GW{gw} · {fixture.home.name} v {fixture.away.name}
        </Text>
        <View style={styles.premium}>
          <Text style={styles.premiumText}>BETA</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Head to head</Text>
        <Text style={styles.sub}>{fixture.kickoffLabel} · {fixture.venue}</Text>
        <View style={styles.h2h}>
          <View style={styles.side}>
            <ClubBadge mono={fixture.home.mono} color={fixture.home.color} size={42} />
            <Text style={styles.team}>{fixture.home.name}</Text>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.side}>
            <ClubBadge mono={fixture.away.mono} color={fixture.away.color} size={42} />
            <Text style={styles.team}>{fixture.away.name}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          {[
            [homeWinPct, "Home win %", awayWinPct],
            [drawPct, "Draw %", drawPct],
            [awayWinPct, "Away win %", homeWinPct],
          ].map(([home, label, away]) => (
            <View key={String(label)} style={styles.statRow}>
              <Text style={styles.statNum}>{home}%</Text>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statNum, { textAlign: "right" }]}>{away}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Win probability</Text>
        <Text style={styles.sub}>
          {fixture.home.name} v {fixture.away.name} · {fixture.kickoffLabel.split("·").pop()?.trim()}
        </Text>
        <View style={styles.prob}>
          <View style={[styles.probSeg, { flex: homeWinPct, backgroundColor: colors.green }]}>
            <Text style={styles.probLight}>{homeWinPct}%</Text>
          </View>
          <View style={[styles.probSeg, { flex: drawPct, backgroundColor: "#34D399" }]}>
            <Text style={styles.probDark}>{drawPct}%</Text>
          </View>
          <View style={[styles.probSeg, { flex: awayWinPct, backgroundColor: "#9CA3AF" }]}>
            <Text style={styles.probLight}>{awayWinPct}%</Text>
          </View>
        </View>
        <Text style={styles.insight}>{insight}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Expected points by pick</Text>
        <Text style={styles.sub}>Which scoreline maximises your GW{gw} return</Text>
        {expectedPoints.map(({ score, xp, width }) => (
          <View key={score} style={styles.xpRow}>
            <Text style={styles.xpScore}>{score}</Text>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${width}%` }]} />
            </View>
            <Text style={styles.xpVal}>{xp.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.lock}>
          <View style={styles.lockIcon}>
            <LockIcon />
          </View>
          <Text style={styles.lockTitle}>Premium insights</Text>
          <Text style={styles.lockCopy}>
            Deeper models, form streaks, and pick-value breakdowns are coming soon.
          </Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Coming soon</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 28, gap: 14 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
  banner: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13 },
  bannerText: { flex: 1, fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 18, color: colors.ink },
  premium: { borderWidth: 1, borderColor: "#34D399", backgroundColor: colors.paper, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  premiumText: { fontFamily: fonts.sansBold, fontSize: 9.5, letterSpacing: 0.8, color: colors.greenDeep },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, overflow: "hidden" },
  h2: { fontFamily: fonts.headline, fontSize: 16, color: colors.ink },
  sub: { marginTop: 3, marginBottom: 15, fontFamily: fonts.sans, fontSize: 11.5, color: colors.muted },
  h2h: { flexDirection: "row", alignItems: "center", gap: 12 },
  side: { flex: 1, alignItems: "center" },
  team: { marginTop: 7, fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink, textAlign: "center" },
  vs: { fontFamily: fonts.headline, fontSize: 12, letterSpacing: 1, color: colors.muted },
  stats: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, gap: 9 },
  statRow: { flexDirection: "row", alignItems: "center" },
  statNum: { width: 44, fontFamily: fonts.headline, fontSize: 16, color: colors.ink },
  statLabel: { flex: 1, textAlign: "center", fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
  prob: { height: 38, borderRadius: 10, overflow: "hidden", flexDirection: "row" },
  probSeg: { alignItems: "center", justifyContent: "center", minWidth: 36 },
  probLight: { fontFamily: fonts.headline, fontSize: 14, color: colors.light },
  probDark: { fontFamily: fonts.headline, fontSize: 14, color: "#08301F" },
  insight: { marginTop: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.page, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 19, color: colors.ink },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 },
  xpScore: { width: 38, fontFamily: fonts.headline, fontSize: 15, color: colors.ink },
  xpTrack: { flex: 1, height: 10, borderRadius: 99, backgroundColor: colors.mintSoft, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: colors.green, borderRadius: 99 },
  xpVal: { fontFamily: fonts.headline, fontSize: 14, color: colors.muted },
  lock: { marginTop: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.page, borderRadius: 12, alignItems: "center", padding: 20, gap: 8 },
  lockIcon: { width: 38, height: 38, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" },
  lockTitle: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  lockCopy: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: "center", maxWidth: 250 },
  cta: { height: 44, borderRadius: 99, backgroundColor: colors.mintSoft, paddingHorizontal: 20, justifyContent: "center" },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.muted },
});
