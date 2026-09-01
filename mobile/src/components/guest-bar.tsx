import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/lib/auth";
import { colors, fonts, radius } from "@/src/theme";

/**
 * Shown across the tabs while browsing as a guest. Picks still work and are
 * kept on device; this is the prompt to make them permanent.
 */
export function GuestBar() {
  const { user, guest } = useAuth();
  const router = useRouter();

  if (user || !guest) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.copy}>Sign in to save your picks</Text>
      <Pressable
        onPress={() => router.push("/sign-in")}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Sign in to save your picks"
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.mint,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  copy: {
    flex: 1,
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.greenDeep,
  },
  button: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.green,
  },
  buttonText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.light,
  },
});
