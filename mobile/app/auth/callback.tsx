import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { createSessionFromUrl } from "@/src/lib/auth-session";
import { createSupabaseClient } from "@/src/lib/supabase/client";
import { colors, fonts } from "@/src/theme";

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string) => {
      try {
        const established = await createSessionFromUrl(url, createSupabaseClient());
        router.replace(established ? "/(tabs)" : "/sign-in");
      } catch {
        router.replace("/sign-in");
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => sub.remove();
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.green} />
      <Text style={styles.text}>Finishing sign in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas },
  text: { marginTop: 12, fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
});
