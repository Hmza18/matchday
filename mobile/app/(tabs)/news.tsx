import { View } from "react-native";
import { AppHeader } from "@/src/components/header";
import { NewsScreen } from "@/src/components/news-screen";
import { colors, spacing } from "@/src/theme";

export default function NewsTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      <AppHeader tab="news" />
      <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <NewsScreen />
      </View>
    </View>
  );
}
