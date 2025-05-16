import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { useRouter, useSegments } from "expo-router";

export default function MainLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (loading) return;

        if (!user) {
          await router.replace("/(auth)/login");
        } else {
          const inAuthGroup = segments[0] === "(auth)";
          if (inAuthGroup) {
            if (role === "master") {
              await router.replace("/(main)/master/home");
            } else if (role === "teacher") {
              await router.replace("/(main)/teacher/home");
            }
          }
        }
      } catch (error) {
        console.error("認証チェック中にエラーが発生しました:", error);
      }
    };

    checkAuth();
  }, [user, role, loading, segments]);

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
