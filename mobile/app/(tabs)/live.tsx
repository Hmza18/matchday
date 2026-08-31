import { View } from "react-native";
import { AppHeader } from "@/src/components/header";
import { LiveScreen } from "@/src/components/live-screen";
import { colors } from "@/src/theme";

export default function LiveTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <AppHeader tab="live" />
      <LiveScreen />
    </View>
  );
}
