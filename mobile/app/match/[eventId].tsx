import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClubBadge, ResultPill } from "@/src/components/ui";
import { loadLiveCentre } from "@/src/lib/football/live";
import { scorePick } from "@/src/lib/football/map";
import type { LiveMatch } from "@/src/lib/football/types";
import { useMatchday } from "@/src/lib/store";
import { colors, fonts, radius, spacing } from "@/src/theme";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "ready"; match: LiveMatch };

export default function MatchModal() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { picks } = useMatchday();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    loadLiveCentre()
      .then((payload) => {
        if (cancelled) return;
        const all = [...payload.live, ...payload.finished, ...payload.upcoming];
        const match = all.find((item) => item.id === eventId);
        setState(match ? { status: "ready", match } : { status: "empty" });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Could not load this match.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <View style={[styles.sheet, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Match summary</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Close match summary"
        >
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>

      {state.status === "loading" ? (
        <View style={styles.centre}>
          <ActivityIndicator color={colors.green} />
          <Text style={styles.centreText}>Loading the match…</Text>
        </View>
      ) : null}

      {state.status === "error" ? (
        <View style={styles.centre}>
          <Text style={styles.centreTitle}>Could not load this match</Text>
          <Text style={styles.centreText}>{state.message}</Text>
        </View>
      ) : null}

      {state.status === "empty" ? (
        <View style={styles.centre}>
          <Text style={styles.centreTitle}>Nothing to show yet</Text>
          <Text style={styles.centreText}>
            This match is not in the current scoreboard.
          </Text>
        </View>
      ) : null}

      {state.status === "ready" ? (
        <MatchBody match={state.match} pick={picks[state.match.id]} />
      ) : null}
    </View>
  );
}

function MatchBody({
  match,
  pick,
}: {
  match: LiveMatch;
  pick: [number, number] | undefined;
}) {
  const scored = scorePick(pick, match.homeGoals, match.awayGoals);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={styles.scoreRow}>
        <View style={styles.side}>
          <ClubBadge
            mono={match.home.mono}
            color={match.home.color}
            logo={match.home.logo}
            size={42}
          />
          <Text style={styles.club} numberOfLines={1}>
            {match.home.name}
          </Text>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={styles.score}>{match.score}</Text>
          <Text style={styles.status}>
            {match.isLive ? `${match.minute}' LIVE` : match.statusShort}
          </Text>
        </View>
        <View style={styles.side}>
          <ClubBadge
            mono={match.away.mono}
            color={match.away.color}
            logo={match.away.logo}
            size={42}
          />
          <Text style={styles.club} numberOfLines={1}>
            {match.away.name}
          </Text>
        </View>
      </View>

      <Text style={styles.venue}>{match.venue}</Text>

      <View style={styles.pickRow}>
        <Text style={styles.pickText}>
          {pick ? `You said ${scored.you}` : "No pick for this one"}
        </Text>
        <ResultPill kind={scored.kind}>{scored.pillText}</ResultPill>
      </View>

      <Text style={styles.sectionTitle}>TIMELINE</Text>
      {match.events.length === 0 ? (
        <Text style={styles.emptyEvents}>No key moments logged yet.</Text>
      ) : (
        match.events
          .slice()
          .reverse()
          .map((event, index) => (
            <View key={`${event.min}-${index}`} style={styles.event}>
              <Text style={styles.eventMin}>{event.min}</Text>
              <View
                style={[
                  styles.eventDot,
                  {
                    backgroundColor:
                      event.kind === "Goal" ? colors.green : colors.warn,
                    borderRadius: event.kind === "Goal" ? radius.pill : 2,
                  },
                ]}
              />
              <Text style={styles.eventKind}>{event.kind}</Text>
              <Text style={styles.eventClub} numberOfLines={1}>
                {event.teamName}
              </Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.page,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handleRow: { alignItems: "center", paddingBottom: spacing.sm },
  handle: {
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { flex: 1, fontFamily: fonts.headline, fontSize: 19, color: colors.ink },
  close: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  closeText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.greenDeep },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 6,
  },
  centreTitle: { fontFamily: fonts.headline, fontSize: 17, color: colors.ink },
  centreText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  body: { padding: spacing.lg, paddingBottom: 40 },
  scoreRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  side: { flex: 1, alignItems: "center", gap: 7 },
  club: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
    textAlign: "center",
  },
  scoreBlock: { alignItems: "center" },
  score: {
    fontFamily: fonts.headline,
    fontSize: 34,
    color: colors.ink,
    fontVariant: ["tabular-nums"],
  },
  status: {
    marginTop: 2,
    fontFamily: fonts.sansSemi,
    fontSize: 11.5,
    color: colors.danger,
  },
  venue: {
    marginTop: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.muted,
    textAlign: "center",
  },
  pickRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pickText: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontFamily: fonts.headline,
    fontSize: 15,
    letterSpacing: 1,
    color: colors.muted,
  },
  emptyEvents: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  event: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 7,
  },
  eventMin: {
    width: 32,
    fontFamily: fonts.headline,
    fontSize: 13,
    color: colors.muted,
    fontVariant: ["tabular-nums"],
  },
  eventDot: { width: 11, height: 11 },
  eventKind: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.ink },
  eventClub: { flex: 1, fontFamily: fonts.sans, fontSize: 12.5, color: colors.muted },
});
