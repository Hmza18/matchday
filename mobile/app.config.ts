import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Matchday",
  slug: "matchday",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "matchday",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.matchday.app",
    buildNumber: "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSPhotoLibraryUsageDescription:
        "Allow Matchday to use your photos for a profile picture.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    package: "com.matchday.app",
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#146C43",
      },
    ],
    "expo-font",
    "expo-web-browser",
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        photosPermission: "Allow Matchday to use your photos for a profile picture.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? "https://matchday.app/privacy",
    termsUrl: process.env.EXPO_PUBLIC_TERMS_URL ?? "https://matchday.app/terms",
    supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "support@matchday.app",
  },
};

export default config;
