export default ({ config }) => {
  // Hardcoded values for development builds
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mkflmlbqfdcvdnknmkmt.supabase.co';
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZmxtbGJxZmRjdmRua25ta210Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDEwMjYsImV4cCI6MjA3NzkxNzAyNn0.yYXWfd3DvzyyPMEs8wzSQUd3jIpfdECBkSveFlC17wU';
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://hotel-manager-backend-ruddy.vercel.app';

  return {
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
      EXPO_PUBLIC_API_BASE_URL: API_BASE_URL,
      EXPO_PUBLIC_SUPABASE_URL: SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
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
  };
};
