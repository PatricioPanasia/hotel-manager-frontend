import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./context/AppNavigator";
import { Platform } from "react-native";

// Inject global styles for web
if (Platform.OS === "web") {
  const style = document.createElement("style");
  style.setAttribute("data-injected", "true");
  style.textContent = `
    /* Basic focus reset */
    input, textarea { outline: none !important; border: none !important; }
    input:focus, textarea:focus { outline: none !important; border: none !important; }

    /* Ensure vector icon fonts are available on web (served from CDN) */
    @font-face {
      font-family: 'MaterialCommunityIcons';
      src: url('https://unpkg.com/@expo/vector-icons@13.0.0/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: 'Ionicons';
      src: url('https://unpkg.com/@expo/vector-icons@13.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.append(style);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
