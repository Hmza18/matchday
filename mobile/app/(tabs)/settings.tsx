import { View } from "react-native";
import { AppHeader } from "@/src/components/header";
import { SettingsScreen } from "@/src/components/settings-screen";
import { colors } from "@/src/theme";

export default function SettingsTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <AppHeader tab="settings" />
      <SettingsScreen />
    </View>
  );
}
