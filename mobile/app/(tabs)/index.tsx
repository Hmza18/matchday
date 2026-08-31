import { View } from "react-native";
import { AppHeader } from "@/src/components/header";
import { PicksScreen } from "@/src/components/picks-screen";
import { colors } from "@/src/theme";

export default function PicksTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <AppHeader tab="picks" />
      <PicksScreen />
    </View>
  );
}
