import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { Footer, Header } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

export default function userLayout() {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // ユーザーの認証状態が確定するまで待機
    if (loading) return;

    // 未認証の場合はログインページへリダイレクト
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    // ユーザーロールが不適切な場合はリダイレクト
    if (role !== "user") {
      router.replace("/(main)/master/home");
      return;
    }

    // 認証済みユーザーがauthグループにいる場合はメインページへリダイレクト
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      router.replace("/(main)/user/home");
    }
  }, [user, loading, role, segments]);

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

  // 未認証の場合は何も表示しない（リダイレクト待ち）
  if (!user || role !== "user") {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* メインコンテンツエリア - フッター分を除いた高さ */}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            gestureEnabled: true,
            animation: "slide_from_right",
            headerShown: false, // デフォルトのWebヘッダーを非表示
          }}
        >
          <Slot />
        </Stack>
      </View>
      {/* フッター - 固定サイズ */}
      <Footer />
      <Toast />
    </View>
  );
}
