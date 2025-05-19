import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

export default function MainLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // 未認証の場合は何もしない（ルートレイアウトで処理）
    if (!user) return; // 認証済みユーザーがauthグループにいる場合のみリダイレクト
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      if (role === "master") {
        router.replace("/(main)/master/home");
      } else if (role === "user") {
        router.replace("/(main)/teacher/home");
      }
    }
  }, [user, role, loading, segments]);

  // ローディング中は待機画面を表示
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 未認証の場合は何も表示しない（ルートレイアウトで処理）
  if (!user) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Slot />
    </Stack>
  );
}
