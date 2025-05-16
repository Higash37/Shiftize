import React, { useEffect } from "react";
import { Stack, Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider } from "@/core/auth/AuthContext";
import { useAuth } from "@/core/auth/useAuth";
import { StatusBar } from "expo-status-bar";
import { createInitialMasterUser } from "@/core/firebase/firebase";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/shared/constants/theme";
import { ThemeProvider } from "@react-navigation/native";
import { AppState } from "react-native";

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 初期マスターユーザーの作成
    createInitialMasterUser().catch((error) => {
      console.error("初期マスターユーザーの作成に失敗:", error);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user) {
      // 未認証の場合は必ずログインページへ
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (inAuthGroup) {
      // 認証済みの場合はメインページへ
      if (role === "master") {
        router.replace("/(main)/master/home");
      } else {
        router.replace("/(main)/teacher/home");
      }
    }
  }, [user, role, loading, segments]);

  // アプリがバックグラウンドから復帰した時に認証状態をチェック
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // アプリがアクティブになった時に認証状態をチェック
        if (!user) {
          router.replace("/(auth)/login");
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Slot />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
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
  );
}
