import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/src/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Off target</Text>
        <Text style={styles.body}>That screen does not exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Back to your picks</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.page,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 22,
    color: colors.ink,
  },
  body: {
    marginTop: 6,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
  },
  link: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 99,
    backgroundColor: colors.green,
  },
  linkText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.light,
  },
});
