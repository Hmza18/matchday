import { View } from "react-native";
import { AppHeader } from "@/src/components/header";
import { InsightsScreen } from "@/src/components/insights-screen";
import { colors } from "@/src/theme";

export default function InsightsTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <AppHeader tab="insights" />
      <InsightsScreen />
    </View>
  );
}
