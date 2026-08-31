import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/src/lib/auth";
import { colors, fonts } from "@/src/theme";

type Mode = "sign-in" | "sign-up";

export function AuthShell({ mode }: { mode: Mode }) {
  const { signIn, signUp, signInWithApple } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const isSignUp = mode === "sign-up";

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        const message = await signUp(name, email, password);
        if (message) {
          setInfo(message);
          return;
        }
      } else {
        await signIn(email, password);
      }
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const onApple = async () => {
    setError(null);
    setInfo(null);
    setAppleLoading(true);
    try {
      await signInWithApple();
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple Sign In failed.");
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.brand}>MATCHDAY</Text>
          <Text style={styles.sub}>
            {isSignUp
              ? "Create your account to lock in picks and climb the table."
              : "Sign in to lock your picks and join the banter."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{isSignUp ? "Create account" : "Welcome back"}</Text>
          <Text style={styles.cardSub}>
            {isSignUp ? "Takes less than a minute." : "Enter your email and password."}
          </Text>

          <Pressable
            style={styles.appleBtn}
            disabled={appleLoading || submitting}
            onPress={() => void onApple()}
          >
            {appleLoading ? (
              <ActivityIndicator color={colors.light} />
            ) : (
              <Text style={styles.appleText}>Continue with Apple</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {isSignUp ? (
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Sam Boyd"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={isSignUp ? "At least 6 characters" : "Your password"}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {info ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{info}</Text>
            </View>
          ) : null}

          <Pressable
            style={styles.submitBtn}
            disabled={submitting || appleLoading}
            onPress={() => void onSubmit()}
          >
            {submitting ? (
              <ActivityIndicator color={colors.light} />
            ) : (
              <Text style={styles.submitText}>
                {isSignUp ? "Create account" : "Sign in"}
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.switch}>
          {isSignUp ? "Already have an account? " : "New here? "}
          <Link href={isSignUp ? "/sign-in" : "/sign-up"} style={styles.switchLink}>
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  scroll: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  hero: { alignItems: "center", marginBottom: 24 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontFamily: fonts.headline, fontSize: 28, color: colors.light },
  brand: {
    marginTop: 14,
    fontFamily: fonts.headline,
    fontSize: 34,
    letterSpacing: 1.2,
    color: colors.ink,
  },
  sub: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: "center",
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
  },
  title: { fontFamily: fonts.headline, fontSize: 22, color: colors.ink },
  cardSub: { marginTop: 4, marginBottom: 16, fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  appleBtn: {
    height: 44,
    borderRadius: 99,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  appleText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.light },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.muted, letterSpacing: 1 },
  field: { marginBottom: 12 },
  label: { marginBottom: 6, fontFamily: fonts.sansSemi, fontSize: 12, color: colors.muted },
  input: {
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.page,
    paddingHorizontal: 16,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },
  errorBox: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    padding: 12,
  },
  errorText: { fontFamily: fonts.sans, fontSize: 13, color: colors.danger },
  infoBox: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.mint,
    backgroundColor: colors.mintSoft,
    padding: 12,
  },
  infoText: { fontFamily: fonts.sans, fontSize: 13, color: colors.greenDeep },
  submitBtn: {
    height: 44,
    borderRadius: 99,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.light },
  switch: { marginTop: 18, textAlign: "center", fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  switchLink: { fontFamily: fonts.sansSemi, color: colors.greenDeep },
});
