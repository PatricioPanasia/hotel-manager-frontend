export default ({ config }) => ({
  ...config,
  name: "Hotel Manager",
  slug: "frontend",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "hotelmanager",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.patoleonel.hotelmanager"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.patoleonel.hotelmanager",
    versionCode: 1,
    permissions: ["INTERNET"],
    usesCleartextTraffic: true,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: false,
        data: [
          { scheme: "hotelmanager", host: "auth", pathPrefix: "/callback" }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  jsEngine: "jsc",
  extra: {
    eas: {
      projectId: "9e46bbd8-4c9d-4c46-adf5-da56857be9bf"
    },
    // Environment variables - accessible via Constants.expoConfig.extra
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: "34.0.0"
        }
      }
    ]
  ]
});
