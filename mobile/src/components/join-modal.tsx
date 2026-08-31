import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMatchday } from "@/src/lib/store";
import { colors, fonts } from "@/src/theme";

type Mode = "create" | "join";

export function JoinLeagueModal() {
  const { joinOpen, setJoinOpen, createLeague, joinLeagueByCode } = useMatchday();
  const [mode, setMode] = useState<Mode>("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setJoinOpen(false);
    setError(null);
    setBusy(false);
  };

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === "create") {
        await createLeague(name);
        setName("");
      } else {
        await joinLeagueByCode(code);
        setCode("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={joinOpen} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Join or create a league</Text>
          <Text style={styles.copy}>
            Start a private league and share the invite code, or join one a mate already set up.
          </Text>

          <View style={styles.tabs}>
            {(["create", "join"] as const).map((value) => {
              const on = mode === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => {
                    setMode(value);
                    setError(null);
                  }}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: on ? colors.green : colors.paper,
                      borderColor: on ? colors.green : colors.line,
                    },
                  ]}
                >
                  <Text style={[styles.tabText, { color: on ? colors.light : colors.ink }]}>
                    {value === "create" ? "Create" : "Join"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === "create" ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Office League, Sunday Five…"
              placeholderTextColor={colors.muted}
              autoFocus
              style={styles.input}
            />
          ) : (
            <TextInput
              value={code}
              onChangeText={(value) => setCode(value.toUpperCase())}
              placeholder="Invite code"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              style={styles.input}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={close} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => void submit()} style={styles.save} disabled={busy}>
              {busy ? (
                <ActivityIndicator color={colors.light} />
              ) : (
                <Text style={styles.saveText}>{mode === "create" ? "Create" : "Join"}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26,26,26,0.4)",
    justifyContent: "flex-end",
    padding: 16,
  },
  sheet: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 19,
    color: colors.ink,
  },
  copy: {
    marginTop: 6,
    marginBottom: 16,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
  },
  input: {
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.page,
    paddingHorizontal: 16,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.ink,
  },
  error: {
    marginTop: 10,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  cancel: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.ink,
  },
  save: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.light,
  },
});
