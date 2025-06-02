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
  Text,
} from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

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

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          height: "100%",
          width: "100%",
        }}
        edges={["top", "bottom", "left", "right"]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Slot />
            </Stack>
          </View>

          {/* 共通固定フッター */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 8,
              alignItems: "center",
            }}
          >
            <View style={{ maxWidth: 600, paddingHorizontal: 12 }}>
              {/* <SlotFooter /> */}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

// function SlotFooter() {
//   return (
// <View>
//   {/* <Text style={{ fontSize: 12, color: "#fff", textAlign: "center" }}>
//   午前2:00～5:00の間、サーバーメンテナンスのためサービスの利用ができなくなる場合があります。
// </Text> */}
// </View>
//   );
// }

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
