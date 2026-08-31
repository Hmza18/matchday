import { useEffect, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/src/lib/auth";
import { colors, fonts } from "@/src/theme";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const inAuthGroup = segments[0] === "sign-in" || segments[0] === "sign-up" || segments[0] === "auth";

  useEffect(() => {
    if (loading) return;
    if (!user && !inAuthGroup) {
      router.replace("/sign-in");
      return;
    }
    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, inAuthGroup, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>M</Text>
        </View>
        <ActivityIndicator color={colors.green} style={{ marginTop: 16 }} />
        <Text style={styles.caption}>Loading Matchday…</Text>
      </View>
    );
  }

  if ((!user && !inAuthGroup) || (user && inAuthGroup)) {
    return (
      <View style={styles.center}>
        <Text style={styles.caption}>Redirecting…</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: fonts.headline,
    fontSize: 24,
    color: colors.light,
  },
  caption: {
    marginTop: 12,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
  },
});
