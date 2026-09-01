import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CheckIcon, ClockIcon, FlameIcon, MinusIcon, PlusIcon } from "@/src/components/icons";
import { ClubBadge } from "@/src/components/ui";
import { formatCountdown } from "@/src/lib/data";
import { loadLiveCentre } from "@/src/lib/football/live";
import { pickPoints, scorePick } from "@/src/lib/football/map";
import type { LiveMatch } from "@/src/lib/football/types";
import { useMatchday } from "@/src/lib/store";
import { colors, fonts } from "@/src/theme";

export function PicksScreen() {
  const { loading, fixtures, fixturesError, pickFor, bump, pop, saved, pickSaveError, picks } = useMatchday();
  const [finished, setFinished] = useState<LiveMatch[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadLiveCentre().then((payload) => {
      if (!cancelled) setFinished(payload.finished);
    }).catch(() => {
      if (!cancelled) setFinished([]);
    });
    return () => { cancelled = true; };
  }, [fixtures]);

  const gwPoints = useMemo(() => {
    let total = 0;
    let scored = 0;
    for (const fixture of fixtures) {
      const match = finished.find((item) => item.id === fixture.id);
      if (!match || match.homeGoals == null || match.awayGoals == null) continue;
      const result = scorePick(picks[fixture.id], match.homeGoals, match.awayGoals);
      total += pickPoints(result.kind);
      scored += 1;
    }
    return { total, scored };
  }, [fixtures, finished, picks]);
  const openCount = fixtures.filter((f) => !f.locked && f.lockSeconds >= 0).length;

  if (loading) {
    return (
      <View style={styles.list}>
        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.card}>
            <View style={[styles.shimmer, { width: "42%", height: 12 }]} />
            <View style={[styles.shimmer, { height: 44, marginTop: 16 }]} />
            <View style={[styles.shimmer, { height: 44, marginTop: 10 }]} />
          </View>
        ))}
      </View>
    );
  }

  if (fixturesError) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorText}>{fixturesError}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {openCount > 0
            ? `${openCount} ${openCount === 1 ? "fixture" : "fixtures"} still open. Tap the steppers — every change saves itself.${gwPoints.scored > 0 ? ` GW points so far: ${gwPoints.total % 1 === 0 ? gwPoints.total.toFixed(0) : gwPoints.total.toFixed(1)}.` : ""}`
            : "All picks locked in for this gameweek."}
        </Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{fixtures.length - openCount}/{fixtures.length || 5} in</Text>
        </View>
      </View>

      {pickSaveError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{pickSaveError}</Text>
        </View>
      ) : null}

      {fixtures.map((fixture) => {
        const left = fixture.lockSeconds;
        const locked = fixture.locked || left < 0;
        const crit = !locked && left < 900;
        const warn = !locked && left < 7200 && !crit;
        const pick = pickFor(fixture.id, fixture.def);
        const hasPick = picks[fixture.id] !== undefined;
        const chipColor = locked
          ? { bg: "#F1F3F2", fg: colors.muted }
          : crit
            ? { bg: "#FEE2E2", fg: "#B91C1C" }
            : warn
              ? { bg: "#FEF3C7", fg: "#92400E" }
              : { bg: colors.page, fg: colors.muted };

        return (
          <View key={fixture.id} style={[styles.card, { borderColor: crit ? "#FCA5A5" : colors.line, opacity: locked ? 0.94 : 1 }]}>
            <View style={styles.metaRow}>
              <View style={styles.metaLeft}>
                <Text style={styles.kickoff}>{fixture.kickoffLabel}</Text>
                {fixture.flag ? (
                  <View style={styles.derby}>
                    <FlameIcon />
                    <Text style={styles.derbyText}>DERBY</Text>
                  </View>
                ) : null}
              </View>
              <View style={[styles.lockChip, { backgroundColor: chipColor.bg }]}>
                <ClockIcon locked={locked} color={chipColor.fg} />
                <Text style={[styles.lockText, { color: chipColor.fg }]}>
                  {locked ? "Picks locked" : `Locks in ${formatCountdown(left)}`}
                </Text>
              </View>
            </View>
            <Text style={styles.venue}>{fixture.venue}</Text>

            {([0, 1] as const).map((side) => {
              const team = side === 0 ? fixture.home : fixture.away;
              const popped = pop === fixture.id + String(side);
              const btnColor = locked ? "#B6BCC4" : colors.greenDeep;
              return (
                <View key={side} style={styles.side}>
                  <ClubBadge mono={team.mono} color={team.color} logo={team.logo} />
                  <Text style={styles.club}>{team.name}</Text>
                  <View style={styles.stepper}>
                    <Pressable
                      disabled={locked}
                      onPress={() => bump(fixture.id, side, -1, locked)}
                      style={[styles.stepBtn, { backgroundColor: locked ? "#F8F9F9" : colors.paper }]}
                      accessibilityLabel={`Decrease ${team.name} score`}
                    >
                      <MinusIcon color={btnColor} />
                    </Pressable>
                    <Text style={[styles.score, { color: locked ? colors.muted : colors.ink, transform: [{ scale: popped ? 1.18 : 1 }] }]}>
                      {pick[side]}
                    </Text>
                    <Pressable
                      disabled={locked}
                      onPress={() => bump(fixture.id, side, 1, locked)}
                      style={[styles.stepBtn, { backgroundColor: locked ? "#F8F9F9" : colors.paper }]}
                      accessibilityLabel={`Increase ${team.name} score`}
                    >
                      <PlusIcon color={btnColor} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.dist}>
              <View style={styles.bar}>
                <View style={{ width: `${fixture.dist[0]}%`, backgroundColor: colors.green }} />
                <View style={{ width: `${fixture.dist[1]}%`, backgroundColor: "#34D399" }} />
                <View style={{ width: `${fixture.dist[2]}%`, backgroundColor: "#C7CDD4" }} />
              </View>
              <View style={styles.distLabels}>
                <Text style={[styles.distLabel, { color: colors.greenDeep, fontFamily: fonts.sansSemi }]}>
                  {fixture.dist[0]}% {fixture.home.mono} win
                </Text>
                <Text style={styles.distLabel}>{fixture.dist[1]}% draw</Text>
                <Text style={styles.distLabel}>
                  {fixture.dist[2]}% {fixture.away.mono} win
                </Text>
              </View>
            </View>

            {saved === fixture.id ? (
              <View style={styles.saved}>
                <CheckIcon />
                <Text style={styles.savedText}>Pick saved</Text>
              </View>
            ) : null}
            {locked ? (
              <Text style={styles.lockedNote}>
                {hasPick
                  ? `Submitted ${pick[0]}–${pick[1]} · read only`
                  : "No pick — 0 pts"}
              </Text>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 28, gap: 14 },
  summary: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryText: { flex: 1, fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.muted },
  countPill: { backgroundColor: colors.mint, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  countText: { fontFamily: fonts.headline, fontSize: 13, color: colors.greenDeep },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16 },
  shimmer: { backgroundColor: colors.mintSoft, borderRadius: 12 },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  metaLeft: { flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7 },
  kickoff: { fontFamily: fonts.sansMed, fontSize: 11.5, color: colors.muted },
  derby: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  derbyText: { fontFamily: fonts.sansBold, fontSize: 10.5, color: "#B45309", letterSpacing: 0.5 },
  lockChip: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  lockText: { fontFamily: fonts.sansSemi, fontSize: 11.5 },
  venue: { marginTop: 4, marginBottom: 10, fontFamily: fonts.sans, fontSize: 11.5, color: colors.muted },
  side: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 5 },
  club: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  stepper: { flexDirection: "row", alignItems: "center" },
  stepBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  score: { width: 40, textAlign: "center", fontFamily: fonts.headline, fontSize: 27 },
  dist: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.line },
  bar: { height: 7, borderRadius: 99, overflow: "hidden", backgroundColor: colors.mintSoft, flexDirection: "row" },
  distLabels: { marginTop: 7, flexDirection: "row", justifyContent: "space-between" },
  distLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  saved: { marginTop: 12, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.mint, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 6 },
  savedText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.greenDeep },
  lockedNote: { marginTop: 12, fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  errorWrap: { padding: 20 },
  errorText: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger },
  errorBanner: { borderRadius: 12, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", padding: 12 },
  errorBannerText: { fontFamily: fonts.sans, fontSize: 13, color: colors.danger },
});

