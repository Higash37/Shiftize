import React, { useEffect } from "react";
import { Stack, Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider } from "@/services/auth/AuthContext";
import { useAuth } from "@/services/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import {
  View,
  AppState,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (inAuthGroup) {
      if (role === "master") {
        router.replace("/(main)/master/home");
      } else if (role === "user") {
        router.replace("/(main)/user/home");
      }
    }
  }, [user, role, loading, segments]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !user) {
        router.replace("/(auth)/login");
      }
    });
    return () => subscription.remove();
  }, [user]);

  // Web/PWA環境での適切なSafeAreaの設定
  const getSafeAreaEdges = () => {
    if (Platform.OS === "web") {
      // PWA時は余白なし、Web時は最小限
      const isPWA = window.matchMedia("(display-mode: standalone)").matches;
      return isPWA ? [] : ["top"]; // PWAでは余白なし、Webではtopのみ
    }
    return ["top", "left", "right", "bottom"]; // ネイティブは全て
  };

  const getContainerStyle = () => {
    if (Platform.OS === "web") {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches;
      if (isPWA) {
        // PWA時：画面全体を使用
        return {
          flex: 1,
          backgroundColor: "#F2F2F7",
          height: "100vh" as any,
          width: "100vw" as any,
        };
      } else {
        // Web時：アドレスバー分を考慮
        return {
          flex: 1,
          backgroundColor: "#F2F2F7",
          height: "calc(100vh - env(keyboard-inset-height, 0px))" as any,
          minHeight: "100vh" as any,
        };
      }
    }
    return {
      flex: 1,
      backgroundColor: "#F2F2F7",
    };
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <SafeAreaView
        style={getContainerStyle()}
        edges={getSafeAreaEdges() as any}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Slot />
        </Stack>
      </SafeAreaView>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={{
          dark: false,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.background,
            text: colors.text.primary,
            border: colors.border,
            notification: colors.primary,
          },
        }}
      >
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
