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

  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF", // 青色から白色に変更
          height: "100%",
          width: "100%",
        }}
        edges={["top", "left", "right"]} // bottomを削除してフッターとの重複を避ける
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Slot />
              </Stack>
            </ScrollView>
          </View>

          {/* セーフエリア考慮したフッター - 位置調整済み */}
          <View
            style={{
              paddingBottom: insets.bottom / 2, // 半分の高さに調整
              width: "100%",
              backgroundColor: colors.primary,
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
