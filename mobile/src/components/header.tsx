import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, RefreshIcon } from "@/src/components/icons";
import { screenCopy, useMatchday } from "@/src/lib/store";
import type { TabId } from "@/src/lib/types";
import { colors, fonts } from "@/src/theme";

export function AppHeader({ tab }: { tab: TabId }) {
  const insets = useSafeAreaInsets();
  const { gw, prevGw, nextGw, refresh, leagues } = useMatchday();
  const [kicker, title] = screenCopy(tab, gw, leagues.length);
  const showGw = tab === "picks" || tab === "live";

  return (
    <LinearGradient
      colors={["#198754", "#146C43"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.row}>
        <View style={styles.titles}>
          <Text style={styles.kicker}>{kicker.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {showGw ? (
          <View style={styles.gw}>
            <Pressable onPress={prevGw} hitSlop={8} style={styles.gwBtn} accessibilityLabel="Previous gameweek">
              <ChevronLeft />
            </Pressable>
            <Text style={styles.gwText}>GW {gw}</Text>
            <Pressable onPress={nextGw} hitSlop={8} style={styles.gwBtn} accessibilityLabel="Next gameweek">
              <ChevronRight />
            </Pressable>
          </View>
        ) : null}
        {tab === "picks" ? (
          <Pressable onPress={refresh} style={styles.refresh} accessibilityLabel="Refresh fixtures">
            <RefreshIcon />
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 13,
  },
  row: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    color: "rgba(248,248,248,0.72)",
    fontFamily: fonts.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1,
  },
  title: {
    color: colors.light,
    fontFamily: fonts.headline,
    fontSize: 23,
    lineHeight: 26,
  },
  gw: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(248,248,248,0.22)",
    backgroundColor: "rgba(248,248,248,0.14)",
    paddingHorizontal: 2,
  },
  gwBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  gwText: {
    color: colors.light,
    fontFamily: fonts.headlineMed,
    fontSize: 15,
    paddingHorizontal: 4,
  },
  refresh: {
    width: 40,
    height: 40,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(248,248,248,0.22)",
    backgroundColor: "rgba(248,248,248,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
});
