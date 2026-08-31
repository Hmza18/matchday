import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { createSupabaseClient } from "@/src/lib/supabase/client";
import { colors, fonts } from "@/src/theme";

async function createSessionFromUrl(url: string) {
  const supabase = createSupabaseClient();
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;
  if (!access_token) return;
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
}

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = async (url: string) => {
      try {
        await createSessionFromUrl(url);
        router.replace("/(tabs)");
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
