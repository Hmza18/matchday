import { Image } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/src/theme";
import type { PillKind } from "@/src/lib/types";

export function ClubBadge({
  mono,
  color,
  logo,
  size = 30,
}: {
  mono: string;
  color: string;
  logo?: string | null;
  size?: number;
}) {
  if (logo) {
    return (
      <Image
        source={{ uri: logo }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="contain"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.light, fontFamily: fonts.headline, fontSize: size * 0.4 }}>
        {mono}
      </Text>
    </View>
  );
}

export function PlayerAvatar({
  initials,
  uri,
  size = 32,
}: {
  initials: string;
  uri?: string | null;
  size?: number;
}) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.mintSoft }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        backgroundColor: colors.green,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.light, fontFamily: fonts.sansBold, fontSize: size * 0.36 }}>
        {initials}
      </Text>
    </View>
  );
}

export function ResultPill({ kind, children }: { kind: PillKind; children: ReactNode }) {
  const style =
    kind === "exact"
      ? { backgroundColor: colors.green, color: colors.light }
      : kind === "close"
        ? { backgroundColor: "#34D399", color: "#08301F" }
        : kind === "result"
          ? { backgroundColor: colors.paper, color: colors.ink, borderWidth: 1, borderColor: colors.muted }
          : { backgroundColor: "#F1F3F2", color: colors.muted };

  return (
    <View style={[styles.pill, { backgroundColor: style.backgroundColor, borderWidth: "borderWidth" in style ? 1 : 0, borderColor: "borderColor" in style ? style.borderColor : "transparent" }]}>
      <Text style={[styles.pillText, { color: style.color }]}>{children}</Text>
    </View>
  );
}

export function FormChip({ result }: { result: "W" | "D" | "L" }) {
  const style =
    result === "W"
      ? { backgroundColor: colors.green, color: colors.light }
      : result === "D"
        ? { backgroundColor: colors.mint, color: colors.greenDeep }
        : { backgroundColor: "#F1F3F2", color: colors.muted };

  return (
    <View style={[styles.chip, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.chipText, { color: style.color }]}>{result}</Text>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 99,
  },
  pillText: {
    fontFamily: fonts.headline,
    fontSize: 12.5,
    letterSpacing: 0.4,
  },
  chip: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
  },
  card: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
});
