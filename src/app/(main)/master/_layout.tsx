import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MasterFooter } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

// Web環境でのスクロールバー完全非表示（PWA対応）
if (typeof document !== "undefined") {
  const globalStyle = document.createElement("style");
  globalStyle.textContent = `
    /* 全ページでスクロールバーを非表示（PWA安全対応） */
    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    /* React Native Web固有の要素 */
    [data-focusable="true"]::-webkit-scrollbar,
    .RNSVScrollView::-webkit-scrollbar,
    [style*="overflow"]::-webkit-scrollbar {
      display: none !important;
    }
    
    /* PWA環境での安全な設定 */
    body {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
      /* PWAでのビューポート高さ確保 */
      min-height: 100vh;
      min-height: 100dvh; /* Dynamic viewport height support */
    }
    
    body::-webkit-scrollbar {
      display: none !important;
    }
    
    /* PWAのアドレスバー対応 */
    @media (display-mode: standalone) {
      body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    }
  `;
  document.head.appendChild(globalStyle);
}

export default function MasterLayout() {
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
    } // ユーザーロールが不適切な場合はリダイレクト
    if (role !== "master") {
      router.replace("/(main)/user/home");
      return;
    }

    // 認証済みユーザーがauthグループにいる場合はメインページへリダイレクト
    const inAuthGroup = segments[0] === "(auth)";
    if (inAuthGroup) {
      router.replace("/(main)/master/home");
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
  if (!user || role !== "master") {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false, // デフォルトヘッダーを非表示にする
            gestureEnabled: true,
            animation: "slide_from_right",
          }}
        >
          <Slot />
        </Stack>
      </View>
      <MasterFooter />
      <Toast />
    </View>
  );
}
