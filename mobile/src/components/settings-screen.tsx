import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraIcon } from "@/src/components/icons";
import { PlayerAvatar } from "@/src/components/ui";
import { useAuth } from "@/src/lib/auth";
import { resetOnboarding } from "@/src/lib/onboarding";
import { useMatchday } from "@/src/lib/store";
import { formatPoints } from "@/src/lib/types";
import { colors, fonts } from "@/src/theme";

export function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, updateAvatar } = useAuth();
  const { leagues, gw, playerStats, setActiveLeagueId, setJoinOpen, board } = useMatchday();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <View style={styles.guestWrap}>
        <Text style={styles.guestTitle}>You're browsing as a guest</Text>
        <Text style={styles.guestSub}>Sign in to save picks, join pools, and set a profile.</Text>
        <Pressable
          onPress={() => router.push("/sign-in")}
          style={styles.guestSignIn}
          accessibilityRole="button"
        >
          <Text style={styles.guestSignInText}>Sign in</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void resetOnboarding().then(() => router.replace("/(onboarding)/welcome"));
          }}
          style={styles.replayIntro}
        >
          <Text style={styles.replayIntroText}>Replay intro</Text>
        </Pressable>
      </View>
    );
  }

  const you = board.find((row) => row.me);

  const pickPhoto = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo access is needed to change your picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    setBusy(true);
    try {
      await updateAvatar(result.assets[0].uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.list}>
      <View style={styles.profile}>
        <Pressable onPress={() => void pickPhoto()} style={styles.avatarWrap} accessibilityLabel="Change profile picture">
          <PlayerAvatar initials={user.initials} uri={user.avatarUrl} size={88} />
          <View style={styles.camera}>
            {busy ? <ActivityIndicator color={colors.light} size="small" /> : <CameraIcon />}
          </View>
        </Pressable>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Pressable onPress={() => void pickPhoto()} style={styles.photoBtn} disabled={busy}>
          <Text style={styles.photoBtnText}>{user.avatarUrl ? "Change photo" : "Add a photo"}</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{formatPoints(playerStats.seasonPoints)}</Text>
          <Text style={styles.statLabel}>Season</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{formatPoints(playerStats.gwPoints)}</Text>
          <Text style={styles.statLabel}>GW{gw}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{leagues.length}</Text>
          <Text style={styles.statLabel}>Leagues</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>TOURNAMENTS</Text>
        <View style={styles.row}>
          <View style={styles.compMark}>
            <Text style={styles.compMarkText}>PL</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Premier League</Text>
            <Text style={styles.rowSub}>
              {playerStats.fixturesPicked} fixtures picked · {playerStats.exacts} exact
            </Text>
          </View>
          <Text style={styles.rowPts}>{formatPoints(playerStats.seasonPoints)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionRow}>
          <Text style={styles.section}>YOUR LEAGUES</Text>
          <Pressable onPress={() => setJoinOpen(true)}>
            <Text style={styles.link}>Join or create</Text>
          </Pressable>
        </View>
        {leagues.map((league) => (
          <Pressable
            key={league.id}
            onPress={() => {
              setActiveLeagueId(league.id);
              router.navigate("/(tabs)/pools");
            }}
            style={styles.row}
          >
            <View style={[styles.compMark, { backgroundColor: league.isPublic ? colors.green : colors.mintSoft }]}>
              <Text style={[styles.compMarkText, { color: league.isPublic ? colors.light : colors.ink }]}>
                {league.isPublic ? "G" : league.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{league.name}</Text>
              <Text style={styles.rowSub}>
                {league.isPublic
                  ? you
                    ? `Public · rank ${you.r}`
                    : "Public league"
                  : "Private · invite friends"}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => {
          void resetOnboarding().then(() => router.replace("/(onboarding)/welcome"));
        }}
        style={styles.replayIntro}
      >
        <Text style={styles.replayIntroText}>Replay intro</Text>
      </Pressable>

      <Pressable
        onPress={() => void signOut()}
        style={styles.signOut}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 36, gap: 14 },
  profile: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  avatarWrap: { position: "relative" },
  camera: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.paper,
  },
  name: { marginTop: 12, fontFamily: fonts.headline, fontSize: 24, color: colors.ink },
  email: { marginTop: 2, fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  photoBtn: {
    marginTop: 12,
    height: 36,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: colors.page,
  },
  photoBtnText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.greenDeep },
  error: { marginTop: 10, fontFamily: fonts.sans, fontSize: 13, color: colors.danger, textAlign: "center" },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 14,
  },
  stat: { flex: 1, alignItems: "center" },
  statVal: { fontFamily: fonts.headline, fontSize: 22, color: colors.ink },
  statLabel: { marginTop: 2, fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  statDivider: { width: 1, backgroundColor: colors.line },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  section: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 0.8, color: colors.muted },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.greenDeep },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  compMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  compMarkText: { fontFamily: fonts.headline, fontSize: 14, color: colors.light },
  rowTitle: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  rowSub: { marginTop: 2, fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  rowPts: { fontFamily: fonts.headline, fontSize: 18, color: colors.ink },
  chev: { fontFamily: fonts.sans, fontSize: 22, color: colors.muted },
  guestWrap: { flex: 1, padding: 20, paddingTop: 40 },
  guestTitle: { fontFamily: fonts.headline, fontSize: 20, color: colors.ink },
  guestSub: { marginTop: 6, marginBottom: 24, fontFamily: fonts.sans, fontSize: 14, color: colors.muted },
  guestSignIn: {
    height: 48,
    borderRadius: 99,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  guestSignInText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.light },
  replayIntro: {
    height: 48,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  replayIntroText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.greenDeep },
  signOut: {
    height: 48,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.danger },
});
