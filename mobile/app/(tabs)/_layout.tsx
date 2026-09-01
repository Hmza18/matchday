import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuestBar } from "@/src/components/guest-bar";
import { IconPath } from "@/src/components/icons";
import { TAB_ICONS } from "@/src/lib/data";
import { colors, fonts } from "@/src/theme";

const TAB_META: Record<
  string,
  { label: string; icon: string; live?: boolean; pro?: boolean }
> = {
  index: { label: "Picks", icon: TAB_ICONS.picks },
  live: { label: "Live", icon: TAB_ICONS.live, live: true },
  pools: { label: "Pools", icon: TAB_ICONS.pools },
  news: { label: "News", icon: TAB_ICONS.news },
  insights: { label: "Insights", icon: TAB_ICONS.insights, pro: true },
  settings: { label: "You", icon: TAB_ICONS.settings },
};

function MatchdayTabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <GuestBar />
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = TAB_META[route.name] ?? { label: route.name, icon: TAB_ICONS.picks };
        const color = focused ? colors.green : colors.muted;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
          >
            {focused ? <View style={styles.indicator} /> : <View style={styles.indicatorOff} />}
            <View>
              <IconPath d={meta.icon} size={22} color={color} />
              {meta.live ? <View style={styles.liveDot} /> : null}
              {meta.pro ? (
                <View style={styles.pro}>
                  <Text style={styles.proText}>P</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <MatchdayTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Picks" }} />
      <Tabs.Screen name="live" options={{ title: "Live" }} />
      <Tabs.Screen name="pools" options={{ title: "Pools" }} />
      <Tabs.Screen name="news" options={{ title: "News" }} />
      <Tabs.Screen name="insights" options={{ title: "Insights" }} />
      <Tabs.Screen name="settings" options={{ title: "You" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minHeight: 52,
  },
  indicator: {
    width: 22,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.green,
    marginBottom: 2,
  },
  indicatorOff: {
    width: 22,
    height: 3,
    marginBottom: 2,
  },
  label: {
    fontFamily: fonts.sansSemi,
    fontSize: 9.5,
  },
  liveDot: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.paper,
  },
  pro: {
    position: "absolute",
    top: -3,
    right: -7,
    width: 12,
    height: 12,
    borderRadius: 99,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  proText: {
    fontFamily: fonts.sansBold,
    fontSize: 7.5,
    color: colors.greenDeep,
  },
});
