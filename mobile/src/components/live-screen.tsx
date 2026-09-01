import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ClubBadge, ResultPill } from "@/src/components/ui";
import { loadLiveCentre } from "@/src/lib/football/live";
import { scorePick } from "@/src/lib/football/map";
import type { LiveMatch } from "@/src/lib/football/types";
import { useMatchday } from "@/src/lib/store";
import { colors, fonts } from "@/src/theme";

export function LiveScreen() {
  const { picks } = useMatchday();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState<LiveMatch[]>([]);
  const [finished, setFinished] = useState<LiveMatch[]>([]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const payload = await loadLiveCentre();
      setLive(payload.live);
      setFinished(payload.finished);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live scores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 40000);
    return () => clearInterval(timer);
  }, [refresh]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {live.length > 0 ? (
        <>
          <View style={styles.liveHead}>
            <View style={styles.dot} />
            <Text style={styles.section}>LIVE NOW</Text>
          </View>

          {live.map((match) => {
            const scored = scorePick(picks[match.id], match.homeGoals, match.awayGoals);
            const pct = Math.min((match.minute / 95) * 100, 100);
            return (
              <Pressable
                key={match.id}
                style={styles.card}
                onPress={() =>
                  router.push({ pathname: "/match/[eventId]", params: { eventId: match.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={`${match.home.name} versus ${match.away.name}, match summary`}
              >
                <View style={styles.top}>
                  <Text style={styles.liveMin}>{match.minute}' LIVE</Text>
                  <Text style={styles.venue}>{match.venue}</Text>
                  <ResultPill kind={scored.kind}>{scored.pillText}</ResultPill>
                </View>
                <View style={styles.scoreRow}>
                  <View style={styles.teamEnd}>
                    <Text style={styles.team}>{match.home.name}</Text>
                    <ClubBadge mono={match.home.mono} color={match.home.color} logo={match.home.logo} />
                  </View>
                  <Text style={styles.score}>{match.score}</Text>
                  <View style={styles.teamStart}>
                    <ClubBadge mono={match.away.mono} color={match.away.color} logo={match.away.logo} />
                    <Text style={styles.team}>{match.away.name}</Text>
                  </View>
                </View>
                <Text style={styles.note}>
                  {picks[match.id] ? (
                    <>
                      You said <Text style={styles.noteStrong}>{scored.you}</Text>
                      {" · "}
                      {scored.note}
                    </>
                  ) : (
                    "No pick for this one"
                  )}
                </Text>
                <View style={styles.rail}>
                  <View style={styles.railTrack} />
                  <View style={[styles.railFill, { width: `${pct}%` }]} />
                  {match.events.map((event, index) => (
                    <View
                      key={`${event.min}-${event.kind}-${index}`}
                      style={[
                        styles.eventDot,
                        {
                          left: `${Math.min((parseInt(event.min, 10) / 95) * 100, 98)}%`,
                          backgroundColor: event.kind === "Goal" ? colors.green : "#F59E0B",
                          borderRadius: event.kind === "Goal" ? 99 : 3,
                        },
                      ]}
                    />
                  ))}
                  <View style={[styles.marker, { left: `${pct}%` }]} />
                </View>
                <View style={styles.events}>
                  {[...match.events].reverse().map((event, index) => (
                    <View key={`${event.min}-${event.kind}-row-${index}`} style={styles.eventRow}>
                      <Text style={styles.eventMin}>{event.min}</Text>
                      <View style={[styles.eventIcon, { backgroundColor: event.kind === "Goal" ? colors.green : "#F59E0B", borderRadius: event.kind === "Goal" ? 99 : 2 }]} />
                      <Text style={styles.eventKind}>{event.kind}</Text>
                      <Text style={styles.eventClub}>{event.teamName}</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </>
      ) : null}

      {finished.length > 0 ? (
        <>
          <Text style={styles.finishedTitle}>FINISHED TODAY</Text>
          {finished.map((match) => {
            const scored = scorePick(picks[match.id], match.homeGoals, match.awayGoals);
            return (
              <Pressable
                key={match.id}
                style={styles.finished}
                onPress={() =>
                  router.push({ pathname: "/match/[eventId]", params: { eventId: match.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={`${match.home.name} versus ${match.away.name}, match summary`}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.finishedRow}>
                    <ClubBadge mono={match.home.mono} color={match.home.color} logo={match.home.logo} size={24} />
                    <Text style={styles.finishedScore}>{match.score}</Text>
                    <ClubBadge mono={match.away.mono} color={match.away.color} logo={match.away.logo} size={24} />
                    <Text style={styles.finishedMatch} numberOfLines={1}>{match.home.name} v {match.away.name}</Text>
                  </View>
                  <Text style={styles.finishedNote}>
                    {picks[match.id] ? `FT · You said ${scored.you}` : "FT · No pick"}
                  </Text>
                </View>
                <ResultPill kind={scored.kind}>{scored.pillText}</ResultPill>
              </Pressable>
            );
          })}
        </>
      ) : null}

      {live.length === 0 && finished.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No live or finished matches right now.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 28, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { fontFamily: fonts.sans, fontSize: 14, color: colors.danger, textAlign: "center" },
  liveHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 99, backgroundColor: colors.danger },
  section: { fontFamily: fonts.headline, fontSize: 15, letterSpacing: 1, color: colors.ink },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveMin: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.danger },
  venue: { flex: 1, fontFamily: fonts.sans, fontSize: 11.5, color: colors.muted },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginVertical: 14 },
  teamEnd: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  teamStart: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  team: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  score: { fontFamily: fonts.headline, fontSize: 34, color: colors.ink },
  note: { textAlign: "center", fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  noteStrong: { fontFamily: fonts.headline, fontSize: 14, color: colors.ink },
  rail: { height: 26, marginTop: 16, justifyContent: "center" },
  railTrack: { position: "absolute", left: 0, right: 0, height: 4, borderRadius: 99, backgroundColor: colors.mintSoft },
  railFill: { position: "absolute", left: 0, height: 4, borderRadius: 99, backgroundColor: "#34D399" },
  eventDot: { position: "absolute", top: 7, width: 12, height: 12, borderWidth: 2, borderColor: colors.paper, marginLeft: -6 },
  marker: { position: "absolute", top: 5, width: 3, height: 16, borderRadius: 2, backgroundColor: colors.danger, marginLeft: -1.5 },
  events: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  eventMin: { width: 30, fontFamily: fonts.headline, fontSize: 13, color: colors.muted },
  eventIcon: { width: 11, height: 11 },
  eventKind: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.ink },
  eventClub: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
  finishedTitle: { marginTop: 8, fontFamily: fonts.headline, fontSize: 15, letterSpacing: 1, color: colors.muted },
  finished: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13 },
  finishedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  finishedScore: { fontFamily: fonts.headline, fontSize: 19, color: colors.ink },
  finishedMatch: { flex: 1, fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
  finishedNote: { marginTop: 4, fontFamily: fonts.sans, fontSize: 11.5, color: colors.muted },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
});
