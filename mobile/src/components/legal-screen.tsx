import type { ReactNode } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SUPPORT_EMAIL } from "@/src/lib/config";
import { colors, fonts } from "@/src/theme";

export function LegalScreen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
    </View>
  );
}

export function LegalSection({ heading, body }: { heading: string; body: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{heading}</Text>
      <Text style={styles.p}>{body}</Text>
    </View>
  );
}

export function LegalContact() {
  return (
    <Pressable onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
      <Text style={styles.link}>{SUPPORT_EMAIL}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.page },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.green,
  },
  back: { marginBottom: 8 },
  backText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.light },
  title: { fontFamily: fonts.headline, fontSize: 26, color: colors.light },
  body: { padding: 16, paddingBottom: 40, gap: 18 },
  section: { gap: 6 },
  h2: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  p: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.muted },
  link: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.greenDeep },
});
