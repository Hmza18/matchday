import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { ChatIcon, SendIcon, TrophyIcon } from "@/src/components/icons";
import { PlayerAvatar } from "@/src/components/ui";
import { useMatchday } from "@/src/lib/store";
import { formatPoints } from "@/src/lib/types";
import { colors, fonts } from "@/src/theme";

export function PoolsScreen() {
  const {
    gw,
    leagues,
    activeLeague,
    setActiveLeagueId,
    setJoinOpen,
    board,
    boardLoading,
    leagueError,
    messages,
    draft,
    setDraft,
    send,
  } = useMatchday();

  const empty = leagues.length === 0 || !activeLeague;

  const shareInvite = () => {
    if (!activeLeague) return;
    void Share.share({
      message: `Join my Matchday league "${activeLeague.name}" with code ${activeLeague.inviteCode}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {leagues.map((league) => {
          const on = activeLeague?.id === league.id;
          return (
            <Pressable
              key={league.id}
              onPress={() => setActiveLeagueId(league.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: on ? colors.green : colors.paper,
                  borderColor: on ? colors.green : colors.line,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: on ? colors.light : colors.ink }]}>
                {league.name}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setJoinOpen(true)} style={styles.joinChip}>
          <Text style={styles.joinChipText}>Join or create</Text>
        </Pressable>
      </ScrollView>

      {leagueError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{leagueError}</Text>
        </View>
      ) : null}

      {empty ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <TrophyIcon />
          </View>
          <Text style={styles.emptyTitle}>You're not in a league yet</Text>
          <Text style={styles.emptyCopy}>
            Create a private league and share the invite code, or join one a mate already set up.
          </Text>
          <Pressable onPress={() => setJoinOpen(true)} style={styles.cta}>
            <Text style={styles.ctaText}>Create or join a league</Text>
          </Pressable>
        </View>
      ) : boardLoading && board.length === 0 ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.green} />
          <Text style={[styles.emptyCopy, { marginTop: 12, marginBottom: 0 }]}>Loading table…</Text>
        </View>
      ) : (
        <>
          <View style={styles.board}>
            <View style={styles.boardHead}>
              <TrophyIcon />
              <Text style={styles.boardTitle}>{activeLeague.name}</Text>
              {activeLeague.isPublic ? (
                <View style={styles.publicPill}>
                  <Text style={styles.publicPillText}>PUBLIC</Text>
                </View>
              ) : (
                <Pressable onPress={shareInvite} style={styles.inviteBtn}>
                  <Text style={styles.inviteText}>{activeLeague.inviteCode}</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.boardMeta}>
              {board.length} {board.length === 1 ? "player" : "players"} · GW{gw}
              {activeLeague.isPublic ? " · everyone on Matchday" : " · tap code to share"}
            </Text>
            <View style={styles.cols}>
              <Text style={[styles.col, { width: 36 }]}>RANK</Text>
              <Text style={[styles.col, { flex: 1 }]}>PLAYER</Text>
              <Text style={[styles.col, { width: 44, textAlign: "right" }]}>GW{gw}</Text>
              <Text style={[styles.col, { width: 48, textAlign: "right" }]}>TOTAL</Text>
            </View>
            {board.map((row) => (
              <View
                key={row.userId}
                style={[styles.row, { backgroundColor: row.me ? colors.mint : colors.paper }]}
              >
                <Text style={styles.rank}>{row.r}</Text>
                <PlayerAvatar initials={row.i} uri={row.avatarUrl} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {row.n}
                  </Text>
                  <Text style={styles.sub}>{row.sub}</Text>
                </View>
                <Text style={[styles.delta, { color: row.d > 0 ? colors.greenDeep : colors.muted }]}>
                  {row.d > 0 ? `+${formatPoints(row.d)}` : formatPoints(row.d)}
                </Text>
                <Text style={styles.total}>{formatPoints(row.tot)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.chat}>
            <View style={styles.chatHead}>
              <ChatIcon />
              <Text style={styles.chatTitle}>BANTER</Text>
              <Text style={styles.chatCount}>{messages.length} messages</Text>
            </View>
            <View style={styles.messages}>
              {messages.length === 0 ? (
                <Text style={styles.emptyChat}>No messages yet. Open the banter.</Text>
              ) : (
                messages.map((message) => (
                  <View key={message.id} style={styles.msg}>
                    <View
                      style={[
                        styles.msgAvatar,
                        { backgroundColor: message.me ? colors.green : colors.mintSoft },
                      ]}
                    >
                      <Text
                        style={[
                          styles.msgInitials,
                          { color: message.me ? colors.light : colors.muted },
                        ]}
                      >
                        {message.i}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.msgMeta}>
                        <Text style={styles.msgName}>{message.n}</Text>
                        <Text style={styles.msgTime}>{message.t}</Text>
                      </View>
                      <View
                        style={[
                          styles.bubble,
                          { backgroundColor: message.me ? colors.mint : colors.page },
                        ]}
                      >
                        <Text style={styles.bubbleText}>{message.x}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
            <View style={styles.composer}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Say something regrettable…"
                placeholderTextColor={colors.muted}
                style={styles.input}
                onSubmitEditing={send}
              />
              <Pressable onPress={send} style={styles.send} accessibilityLabel="Send message">
                <SendIcon />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14, paddingBottom: 28, gap: 14 },
  chips: { gap: 8, paddingBottom: 4 },
  chip: { height: 36, borderRadius: 99, borderWidth: 1, paddingHorizontal: 15, justifyContent: "center" },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13 },
  joinChip: {
    height: 36,
    borderRadius: 99,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.green,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: colors.paper,
  },
  joinChipText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.greenDeep },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    padding: 12,
  },
  errorText: { fontFamily: fonts.sans, fontSize: 13, color: colors.danger },
  empty: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 34,
    alignItems: "center",
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 99,
    backgroundColor: colors.mint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontFamily: fonts.headline, fontSize: 19, color: colors.ink, marginBottom: 6 },
  emptyCopy: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  cta: {
    height: 44,
    borderRadius: 99,
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  ctaText: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.light },
  board: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    overflow: "hidden",
  },
  boardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  boardTitle: { flex: 1, fontFamily: fonts.headline, fontSize: 16, color: colors.ink },
  inviteBtn: {
    borderRadius: 99,
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inviteText: { fontFamily: fonts.headline, fontSize: 13, letterSpacing: 1, color: colors.greenDeep },
  publicPill: {
    borderRadius: 99,
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  publicPillText: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 0.8, color: colors.greenDeep },
  boardMeta: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: colors.muted,
  },
  cols: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.page,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  col: { fontFamily: fonts.sansSemi, fontSize: 10.5, letterSpacing: 0.6, color: colors.muted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F2",
  },
  rank: { width: 28, fontFamily: fonts.headline, fontSize: 16, color: colors.ink },
  avatar: { width: 32, height: 32, borderRadius: 99, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 11.5 },
  name: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  delta: { width: 40, textAlign: "right", fontFamily: fonts.headline, fontSize: 14 },
  total: { width: 48, textAlign: "right", fontFamily: fonts.headline, fontSize: 18, color: colors.ink },
  chat: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    overflow: "hidden",
  },
  chatHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  chatTitle: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 0.7, color: colors.muted },
  chatCount: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  messages: { padding: 15, gap: 13 },
  emptyChat: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  msg: { flexDirection: "row", gap: 9 },
  msgAvatar: { width: 26, height: 26, borderRadius: 99, alignItems: "center", justifyContent: "center" },
  msgInitials: { fontFamily: fonts.sansBold, fontSize: 10 },
  msgMeta: { flexDirection: "row", alignItems: "baseline", gap: 7 },
  msgName: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.ink },
  msgTime: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.muted },
  bubble: {
    marginTop: 3,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  bubbleText: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 19, color: colors.ink },
  composer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.page,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 99,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
});
