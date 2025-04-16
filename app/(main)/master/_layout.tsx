import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../providers/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/constants/theme";
import { MasterFooter } from "@/components/Layout/MasterFooter";
import Toast from "react-native-toast-message";

export default function MasterLayout() {
  const { user, loading, userRole } = useAuth();
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
    if (userRole !== "master") {
      router.replace("/(main)/teacher");
      return;
    }

    // 認証済みユーザーがauthグループにいる場合はメインページへリダイレクト
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      router.replace("/(main)/master/home");
    }
  }, [user, loading, userRole, segments]);

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
  if (!user || userRole !== "master") {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_right",
        }}
      >
        <Slot />
      </Stack>
      <MasterFooter />
      <Toast />
    </View>
  );
}
