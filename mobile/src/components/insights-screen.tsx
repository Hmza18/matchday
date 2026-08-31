import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LockIcon, SparkleIcon } from "@/src/components/icons";
import { ClubBadge, FormChip } from "@/src/components/ui";
import { useMatchday } from "@/src/lib/store";
import { colors, fonts } from "@/src/theme";

const LOCKED_ROWS = [
  ["2–0", "1.62", 92],
  ["2–1", "1.48", 84],
  ["1–0", "1.21", 68],
  ["3–1", "0.94", 52],
] as const;

export function InsightsScreen() {
  const { premiumUnlocked, unlockPremium } = useMatchday();

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.banner}>
        <SparkleIcon />
        <Text style={styles.bannerText}>Model data for GW7, refreshed 40 minutes ago.</Text>
        <View style={styles.premium}>
          <Text style={styles.premiumText}>PREMIUM</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Head to head</Text>
        <Text style={styles.sub}>Last five meetings · league only</Text>
        <View style={styles.h2h}>
          <View style={styles.side}>
            <ClubBadge mono="AU" color="#1E3A8A" size={42} />
            <Text style={styles.team}>Atlas United</Text>
            <View style={styles.form}>
              {(["W", "W", "D", "L", "W"] as const).map((result, index) => (
                <FormChip key={`h-${index}`} result={result} />
              ))}
            </View>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={styles.side}>
            <ClubBadge mono="CB" color="#BE123C" size={42} />
            <Text style={styles.team}>Coral Bay FC</Text>
            <View style={styles.form}>
              {(["L", "D", "W", "W", "L"] as const).map((result, index) => (
                <FormChip key={`a-${index}`} result={result} />
              ))}
            </View>
          </View>
        </View>
        <View style={styles.stats}>
          {[[11, "Goals for", 7], [6, "Goals against", 9], [2, "Clean sheets", 1]].map(([home, label, away]) => (
            <View key={String(label)} style={styles.statRow}>
              <Text style={styles.statNum}>{home}</Text>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statNum, { textAlign: "right" }]}>{away}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Win probability</Text>
        <Text style={styles.sub}>Atlas United v Coral Bay FC · Sat 15:00</Text>
        <View style={styles.prob}>
          <View style={[styles.probSeg, { flex: 54, backgroundColor: colors.green }]}>
            <Text style={styles.probLight}>54%</Text>
          </View>
          <View style={[styles.probSeg, { flex: 24, backgroundColor: "#34D399" }]}>
            <Text style={styles.probDark}>24%</Text>
          </View>
          <View style={[styles.probSeg, { flex: 22, backgroundColor: "#9CA3AF" }]}>
            <Text style={styles.probLight}>22%</Text>
          </View>
        </View>
        <Text style={styles.insight}>
          Most-backed scoreline is 2–1 Atlas at 19% of all picks. The model likes 2–0 slightly more.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Expected points by pick</Text>
        <Text style={styles.sub}>Which scoreline maximises your GW7 return</Text>
        {LOCKED_ROWS.map(([score, xp, width]) => (
          <View key={score} style={styles.xpRow}>
            <Text style={styles.xpScore}>{score}</Text>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${width}%` }]} />
            </View>
            <Text style={styles.xpVal}>{xp}</Text>
          </View>
        ))}
        {!premiumUnlocked ? (
          <View style={styles.lock}>
            <View style={styles.lockIcon}>
              <LockIcon />
            </View>
            <Text style={styles.lockTitle}>Expected points by pick</Text>
            <Text style={styles.lockCopy}>See the value in every scoreline before you commit.</Text>
            <Pressable onPress={unlockPremium} style={styles.cta}>
              <Text style={styles.ctaText}>Unlock with Premium</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 28, gap: 14 },
  banner: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.mint, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13 },
  bannerText: { flex: 1, fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 18, color: colors.ink },
  premium: { borderWidth: 1, borderColor: "#34D399", backgroundColor: colors.paper, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  premiumText: { fontFamily: fonts.sansBold, fontSize: 9.5, letterSpacing: 0.8, color: colors.greenDeep },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16, overflow: "hidden" },
  h2: { fontFamily: fonts.headline, fontSize: 16, color: colors.ink },
  sub: { marginTop: 3, marginBottom: 15, fontFamily: fonts.sans, fontSize: 11.5, color: colors.muted },
  h2h: { flexDirection: "row", alignItems: "center", gap: 12 },
  side: { flex: 1, alignItems: "center" },
  team: { marginTop: 7, fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  form: { flexDirection: "row", gap: 4, marginTop: 9 },
  vs: { fontFamily: fonts.headline, fontSize: 12, letterSpacing: 1, color: colors.muted },
  stats: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, gap: 9 },
  statRow: { flexDirection: "row", alignItems: "center" },
  statNum: { width: 44, fontFamily: fonts.headline, fontSize: 16, color: colors.ink },
  statLabel: { flex: 1, textAlign: "center", fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
  prob: { height: 38, borderRadius: 10, overflow: "hidden", flexDirection: "row" },
  probSeg: { alignItems: "center", justifyContent: "center" },
  probLight: { fontFamily: fonts.headline, fontSize: 14, color: colors.light },
  probDark: { fontFamily: fonts.headline, fontSize: 14, color: "#08301F" },
  insight: { marginTop: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.page, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 12, fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 19, color: colors.ink },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 },
  xpScore: { width: 38, fontFamily: fonts.headline, fontSize: 15, color: colors.ink },
  xpTrack: { flex: 1, height: 10, borderRadius: 99, backgroundColor: colors.mintSoft, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: colors.green, borderRadius: 99 },
  xpVal: { fontFamily: fonts.headline, fontSize: 14, color: colors.muted },
  lock: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(245,250,248,0.86)", alignItems: "center", justifyContent: "center", padding: 20, gap: 8 },
  lockIcon: { width: 38, height: 38, borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" },
  lockTitle: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  lockCopy: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: "center", maxWidth: 250 },
  cta: { height: 44, borderRadius: 99, backgroundColor: colors.green, paddingHorizontal: 20, justifyContent: "center" },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.light },
});
