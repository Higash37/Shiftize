import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";

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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
