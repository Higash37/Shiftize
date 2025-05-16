import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { useRouter } from "expo-router";

export default function AuthLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (user) {
        const route = role === "master" ? "/(main)/master" : "/(main)/shifts";
        await router.replace(route);
      }
    };

    checkAuth();
  }, [user, role, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
