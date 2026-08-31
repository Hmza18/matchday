import { View } from "react-native";
import { AppHeader } from "@/src/components/header";
import { PoolsScreen } from "@/src/components/pools-screen";
import { colors } from "@/src/theme";

export default function PoolsTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <AppHeader tab="pools" />
      <PoolsScreen />
    </View>
  );
}
