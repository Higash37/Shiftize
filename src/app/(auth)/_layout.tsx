import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";
import { View, Platform } from "react-native";

// Web/PWA環境でのズーム制御
if (typeof document !== "undefined") {
  // ダブルタップズーム防止
  let lastTap = 0;
  document.addEventListener(
    "touchend",
    function (e) {
      const now = Date.now();
      if (now - lastTap <= 300) {
        e.preventDefault();
      }
      lastTap = now;
    },
    { passive: false }
  );

  // ピンチズーム防止
  document.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
  });

  document.addEventListener("gesturechange", function (e) {
    e.preventDefault();
  });

  document.addEventListener("gestureend", function (e) {
    e.preventDefault();
  });
}

export default function AuthLayout() {
  const { user, role, loading, authError } = useAuth();
  const router = useRouter();
  useEffect(() => {
    console.log("useEffectがトリガーされました", {
      user,
      role,
      loading,
      authError,
    });
    const checkAuth = async () => {
      console.log("checkAuth関数が呼び出されました", {
        user,
        role,
        loading,
        authError,
      });
      if (loading) return;

      // 認証エラーがある場合は遷移しない
      if (authError) {
        console.log("認証エラーがあるため遷移しません:", authError);
        return;
      }

      if (user) {
        let route;
        if (role === "master") {
          route = "/(main)/master/home";
        } else if (role === "user") {
          route = "/(main)/user/home";
        }
        if (route) {
          console.log("遷移先が決定されました", { route });
          await router.replace(route);
        }
      }
    };

    checkAuth();
  }, [user, role, loading, authError]);

  const webContainerStyle =
    Platform.OS === "web"
      ? {
          margin: 0,
          padding: 0,
          height: "100vh" as any,
          width: "100vw" as any,
          position: "fixed" as any,
          top: 0,
          left: 0,
        }
      : {};

  return (
    <View style={[{ flex: 1 }, webContainerStyle]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Slot />
      </Stack>
    </View>
  );
}
