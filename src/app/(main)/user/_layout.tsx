import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { Footer, Header } from "@/common/common-ui/ui-layout";
import Toast from "react-native-toast-message";

// Web環境でのPWA対応CSS（ユーザー側）
if (typeof document !== "undefined") {
  const globalStyle = document.createElement("style");
  globalStyle.textContent = `
    /* PWA固有の設定 */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      border-radius: 0 !important;
      -webkit-border-radius: 0 !important;
      overflow-x: hidden !important;
      width: 100% !important;
      height: 100% !important;
      position: fixed !important;
      -webkit-overflow-scrolling: touch !important;
    }
    
    /* PWAでのズーム・タッチ制御 */
    body {
      touch-action: manipulation !important;
      -webkit-user-select: none !important;
      -webkit-touch-callout: none !important;
      -webkit-tap-highlight-color: transparent !important;
      -webkit-text-size-adjust: 100% !important;
      -ms-text-size-adjust: 100% !important;
    }
    
    /* セーフエリア対応（PWAスマホ専用） */
    @media (display-mode: standalone) {
      html, body {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        margin: 0 !important;
        border-radius: 0 !important;
        height: 100vh !important;
        height: 100dvh !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
      }
      
      /* React Native Web のルートコンテナ */
      #root, [data-reactroot], div[data-reactroot] {
        margin: 0 !important;
        padding: 0 !important;
        border-radius: 0 !important;
        height: 100vh !important;
        height: 100dvh !important;
        width: 100vw !important;
        overflow: hidden !important;
        max-height: 100vh !important;
        max-height: 100dvh !important;
      }
      
      /* React Native Web の全てのView要素 */
      div[style*="display: flex"], 
      div[style*="flex-direction"], 
      div[style*="flexDirection"] {
        border-radius: 0 !important;
        -webkit-border-radius: 0 !important;
      }
      
      /* ヘッダー・フッターの角丸削除 */
      [data-testid*="header"], 
      [style*="borderBottomLeftRadius"],
      [style*="borderBottomRightRadius"],
      [style*="borderTopLeftRadius"],
      [style*="borderTopRightRadius"],
      [style*="border-bottom-left-radius"],
      [style*="border-bottom-right-radius"],
      [style*="border-top-left-radius"],
      [style*="border-top-right-radius"] {
        border-radius: 0 !important;
        -webkit-border-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-top-left-radius: 0 !important;
        border-top-right-radius: 0 !important;
      }
    }
    
    /* 全ページでスクロールバーを非表示 */
    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    /* PWAモバイル特有の調整 */
    @media (max-width: 768px) and (display-mode: standalone) {
      * {
        border-radius: 0 !important;
        -webkit-border-radius: 0 !important;
      }
      
      /* ビューポートの固定 */
      html {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      body {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
      }
    }
  `;
  document.head.appendChild(globalStyle);

  // PWA専用の動的修正
  const applyPWAFixes = () => {
    // すべての角丸を強制的に削除
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.borderRadius = "0px";
        el.style.borderTopLeftRadius = "0px";
        el.style.borderTopRightRadius = "0px";
        el.style.borderBottomLeftRadius = "0px";
        el.style.borderBottomRightRadius = "0px";
      }
    });

    // ビューポートのリセット
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";
    document.documentElement.style.margin = "0px";
    document.documentElement.style.padding = "0px";
  };

  // PWA環境でのみ実行
  if (window.matchMedia("(display-mode: standalone)").matches) {
    document.addEventListener("DOMContentLoaded", applyPWAFixes);
    // 動的コンテンツ用
    const observer = new MutationObserver(applyPWAFixes);
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

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
      <Footer />
      <Toast />
    </View>
  );
}
