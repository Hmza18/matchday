import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line } from "react-native-svg";
import { ArrowRightIcon } from "@/src/components/icons";
import { ClubBadge } from "@/src/components/ui";
import { useAuth } from "@/src/lib/auth";
import { markOnboarded } from "@/src/lib/onboarding";
import { colors, fonts, radius, spacing } from "@/src/theme";

const PANEL_COUNT = 4;

export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { continueAsGuest } = useAuth();
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  useAnimatedReaction(
    () => Math.round(scrollX.value / width),
    (page, previousPage) => {
      if (page !== previousPage) {
        runOnJS(setIndex)(Math.max(0, Math.min(PANEL_COUNT - 1, page)));
      }
    },
  );

  const finish = async () => {
    await markOnboarded();
  };

  const onSkip = async () => {
    await finish();
    router.replace("/sign-in");
  };

  const onCreateAccount = async () => {
    await finish();
    router.replace("/sign-up");
  };

  const onSignIn = async () => {
    await finish();
    router.replace("/sign-in");
  };

  const onGuest = async () => {
    await finish();
    await continueAsGuest();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.green, colors.greenDeep, colors.greenInk]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <PitchMarks width={width} />

      <View style={[styles.topRow, { top: insets.top + spacing.md }]}>
        <View style={styles.wordmark}>
          <View style={styles.wordmarkTile}>
            <Text style={styles.wordmarkTileText}>M</Text>
          </View>
          <Text style={styles.wordmarkText}>MATCHDAY</Text>
        </View>
        {index < PANEL_COUNT - 1 ? (
          <Pressable
            onPress={onSkip}
            style={styles.skip}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            hitSlop={8}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : null}
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Panel width={width}>
          <ScorelinePanel active={index === 0} reduceMotion={reduceMotion} />
        </Panel>
        <Panel width={width}>
          <PointsPanel active={index === 1} reduceMotion={reduceMotion} />
        </Panel>
        <Panel width={width}>
          <LeaderboardPanel active={index === 2} reduceMotion={reduceMotion} />
        </Panel>
        <Panel width={width}>
          <ReadyPanel onCreateAccount={onCreateAccount} onSignIn={onSignIn} onGuest={onGuest} />
        </Panel>
      </Animated.ScrollView>

      <View style={[styles.dots, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        {Array.from({ length: PANEL_COUNT }, (_, dotIndex) => (
          <Dot key={dotIndex} dotIndex={dotIndex} scrollX={scrollX} width={width} />
        ))}
      </View>
    </View>
  );
}

function Panel({ width, children }: { width: number; children: ReactNode }) {
  return <View style={[styles.panel, { width }]}>{children}</View>;
}

function Dot({
  dotIndex,
  scrollX,
  width,
}: {
  dotIndex: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(dotIndex - 1) * width, dotIndex * width, (dotIndex + 1) * width];
    const dotWidth = interpolate(scrollX.value, input, [6, 20, 6], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { width: dotWidth, opacity };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

/** Centre-circle arc + touchline, bleeding off the top-right corner. */
function PitchMarks({ width }: { width: number }) {
  const size = width * 0.95;
  return (
    <View style={[styles.pitchMarks, { width: size, height: size, top: -size * 0.22, right: -size * 0.3 }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="200" cy="0" r="92" stroke="rgba(255,255,255,0.07)" strokeWidth="1.4" fill="none" />
        <Line x1="0" y1="46" x2="200" y2="46" stroke="rgba(255,255,255,0.07)" strokeWidth="1.4" />
      </Svg>
    </View>
  );
}

/** Panel 1 — a large scoreline is the hero; crests settle in beneath it. */
function ScorelinePanel({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  const rise = useSharedValue(reduceMotion ? 1 : 0);
  const [home, setHome] = useState(reduceMotion ? 2 : 0);
  const [away, setAway] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!active) {
      rise.value = reduceMotion ? 1 : 0;
      setHome(reduceMotion ? 2 : 0);
      setAway(reduceMotion ? 1 : 0);
      return;
    }
    if (reduceMotion) {
      rise.value = 1;
      setHome(2);
      setAway(1);
      return;
    }
    rise.value = withSpring(1, { damping: 15, stiffness: 110 });
    const t1 = setTimeout(() => setHome(1), 520);
    const t2 = setTimeout(() => setHome(2), 800);
    const t3 = setTimeout(() => setAway(1), 1040);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduceMotion]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: interpolate(rise.value, [0, 1], [18, 0]) }],
  }));
  const crestStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: interpolate(rise.value, [0, 1], [12, 0]) }],
  }));

  return (
    <View style={styles.visualBlock}>
      <Animated.View style={heroStyle}>
        <Text style={styles.heroScore}>
          {home} <Text style={styles.heroScoreColon}>:</Text> {away}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.crestRow, crestStyle]}>
        <View style={styles.crestGroup}>
          <ClubBadge mono="AU" color="#1E3A8A" logo={null} size={38} />
          <Text style={styles.crestLabel}>ATLAS</Text>
        </View>
        <Text style={styles.crestVs}>V</Text>
        <View style={styles.crestGroup}>
          <ClubBadge mono="CB" color="#BE123C" logo={null} size={38} />
          <Text style={styles.crestLabel}>CORAL BAY</Text>
        </View>
      </Animated.View>
      <PanelCopy headline="Predict every scoreline" body="Not just who wins. How it ends." />
    </View>
  );
}

/** Panel 2 — the exact score value leads; close and result sit as quiet detail. */
function PointsPanel({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  const hero = useSharedValue(reduceMotion ? 1 : 0);
  const rows = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!active) {
      hero.value = reduceMotion ? 1 : 0;
      rows.value = reduceMotion ? 1 : 0;
      return;
    }
    if (reduceMotion) {
      hero.value = 1;
      rows.value = 1;
      return;
    }
    hero.value = withSpring(1, { damping: 15, stiffness: 120 });
    rows.value = withDelay(220, withSpring(1, { damping: 15, stiffness: 120 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduceMotion]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: hero.value,
    transform: [{ translateY: interpolate(hero.value, [0, 1], [16, 0]) }],
  }));
  const rowsStyle = useAnimatedStyle(() => ({
    opacity: rows.value,
    transform: [{ translateY: interpolate(rows.value, [0, 1], [12, 0]) }],
  }));

  return (
    <View style={styles.visualBlock}>
      <Animated.View style={heroStyle}>
        <Text style={styles.heroScore}>3.0</Text>
        <Text style={styles.heroCaption}>EXACT SCORE</Text>
      </Animated.View>
      <Animated.View style={[styles.statRows, rowsStyle]}>
        <View style={styles.statRow}>
          <View style={[styles.statDot, { backgroundColor: colors.mintBright }]} />
          <Text style={styles.statLabel}>Close</Text>
          <Text style={styles.statValue}>1.5</Text>
        </View>
        <View style={styles.statRow}>
          <View style={[styles.statDot, { backgroundColor: "rgba(255,255,255,0.4)" }]} />
          <Text style={styles.statLabel}>Result</Text>
          <Text style={styles.statValue}>1.0</Text>
        </View>
      </Animated.View>
      <PanelCopy headline="Three points for exact" body="Get the scoreline right, take the lot." />
    </View>
  );
}

/** Panel 3 — a frosted leaderboard card; a row overtakes, its arrow flipping to ▲. */
function LeaderboardPanel({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  const swap = useSharedValue(reduceMotion ? 1 : 0);
  const cardIn = useSharedValue(reduceMotion ? 1 : 0);
  const rowHeight = 56;

  useEffect(() => {
    if (!active) {
      swap.value = reduceMotion ? 1 : 0;
      cardIn.value = reduceMotion ? 1 : 0;
      return;
    }
    if (reduceMotion) {
      swap.value = 1;
      cardIn.value = 1;
      return;
    }
    cardIn.value = withSpring(1, { damping: 16, stiffness: 130 });
    swap.value = withDelay(500, withSpring(1, { damping: 16, stiffness: 110 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduceMotion]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardIn.value,
    transform: [{ translateY: interpolate(cardIn.value, [0, 1], [14, 0]) }],
  }));
  const topRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(swap.value, [0, 1], [0, rowHeight]) }],
  }));
  const bottomRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(swap.value, [0, 1], [0, -rowHeight]) }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    opacity: swap.value,
    transform: [{ scale: interpolate(swap.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <View style={styles.visualBlock}>
      <Animated.View style={[styles.cardWrap, cardStyle]}>
        <View style={styles.boardCard}>
          <View style={styles.boardStack}>
            <Animated.View style={[styles.boardRow, styles.boardRowTop, topRowStyle]}>
              <Text style={styles.boardName}>Priya Raman</Text>
              <Text style={styles.boardPts}>148</Text>
            </Animated.View>
            <Animated.View style={[styles.boardRow, styles.boardRowBottom, bottomRowStyle]}>
              <Text style={styles.boardName}>Tom Vasquez</Text>
              <Animated.Text style={[styles.boardArrow, arrowStyle]}>▲</Animated.Text>
              <Text style={styles.boardPts}>151</Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
      <PanelCopy
        headline="Beat your group"
        body="Private pools, live tables, and a chat that never lets it go."
      />
    </View>
  );
}

function PanelCopy({ headline, body }: { headline: string; body?: string }) {
  return (
    <View style={styles.copy}>
      <Text style={styles.headline}>{headline}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

/** Panel 4 — one strong CTA, everything else recedes to text links. */
function ReadyPanel({
  onCreateAccount,
  onSignIn,
  onGuest,
}: {
  onCreateAccount: () => void;
  onSignIn: () => void;
  onGuest: () => void;
}) {
  return (
    <View style={styles.readyBlock}>
      <View style={styles.readyCopy}>
        <Text style={styles.readyHeadline}>Ready to make{"\n"}your picks?</Text>
        <Text style={styles.body}>Join a pool, lock a score, and see how you rank.</Text>
      </View>

      <View style={styles.ctaBlock}>
        <Pressable
          onPress={onCreateAccount}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Create an account"
        >
          <Text style={styles.primaryBtnText}>Create account</Text>
          <ArrowRightIcon color={colors.greenInk} />
        </Pressable>

        <Text style={styles.switchLine}>
          Already a user?{" "}
          <Text style={styles.switchLink} onPress={onSignIn}>
            Sign in
          </Text>
        </Text>

        <Pressable
          onPress={onGuest}
          style={styles.guestLink}
          accessibilityRole="button"
          accessibilityLabel="Look around without an account"
        >
          <Text style={styles.guestLinkText}>Look around first</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.greenInk },
  pitchMarks: { position: "absolute", pointerEvents: "none" },
  topRow: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wordmark: { flexDirection: "row", alignItems: "center", gap: 9 },
  wordmarkTile: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmarkTileText: { fontFamily: fonts.headline, fontSize: 14, color: colors.light },
  wordmarkText: {
    fontFamily: fonts.headline,
    fontSize: 15,
    letterSpacing: 1.6,
    color: "rgba(255,255,255,0.92)",
  },
  skip: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  skipText: { fontFamily: fonts.sansSemi, fontSize: 14, color: "rgba(255,255,255,0.8)" },
  panel: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xxl },
  visualBlock: { width: "100%", alignItems: "center" },
  heroScore: {
    fontFamily: fonts.headline,
    fontSize: 88,
    lineHeight: 92,
    color: colors.light,
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  heroScoreColon: { color: "rgba(255,255,255,0.5)" },
  heroCaption: {
    marginTop: 2,
    textAlign: "center",
    fontFamily: fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.mintBright,
  },
  crestRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xl,
  },
  crestGroup: { alignItems: "center", gap: 7, width: 76 },
  crestLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.68)",
  },
  crestVs: {
    marginTop: 8,
    fontFamily: fonts.headlineMed,
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  statRows: { marginTop: spacing.xl, gap: spacing.sm, width: "100%", maxWidth: 220 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statLabel: { flex: 1, fontFamily: fonts.sansMed, fontSize: 14, color: "rgba(255,255,255,0.72)" },
  statValue: {
    fontFamily: fonts.headline,
    fontSize: 16,
    color: colors.light,
    fontVariant: ["tabular-nums"],
  },
  copy: { marginTop: spacing.xxl, alignItems: "center" },
  headline: {
    fontFamily: fonts.headline,
    fontSize: 28,
    lineHeight: 33,
    color: colors.light,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  body: {
    marginTop: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    maxWidth: 280,
  },
  cardWrap: { width: "100%", alignItems: "center" },
  boardCard: {
    width: "100%",
    maxWidth: 340,
    height: 56 * 2,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  boardStack: { width: "100%", height: 56 * 2, justifyContent: "flex-start" },
  boardRowTop: { top: 0 },
  boardRowBottom: { top: 56 },
  boardRow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  boardName: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 14, color: colors.light },
  boardArrow: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.mintBright },
  boardPts: {
    fontFamily: fonts.headline,
    fontSize: 17,
    color: colors.light,
    fontVariant: ["tabular-nums"],
  },
  readyBlock: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxl,
    paddingTop: 130,
    paddingBottom: spacing.xxl,
  },
  readyCopy: {},
  readyHeadline: {
    fontFamily: fonts.headline,
    fontSize: 36,
    lineHeight: 41,
    color: colors.light,
    letterSpacing: -0.5,
  },
  ctaBlock: { width: "100%", gap: spacing.md },
  primaryBtn: {
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.light,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryBtnPressed: { backgroundColor: "#E9EDEA" },
  primaryBtnText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.greenInk },
  switchLine: {
    textAlign: "center",
    fontFamily: fonts.sans,
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
  },
  switchLink: { fontFamily: fonts.sansBold, color: colors.light },
  guestLink: { alignSelf: "center", minHeight: 44, justifyContent: "center" },
  guestLinkText: { fontFamily: fonts.sansSemi, fontSize: 13, color: "rgba(255,255,255,0.5)" },
  dots: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  dot: { height: 6, borderRadius: radius.pill, backgroundColor: colors.mintBright },
});
