import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/services/auth/useAuth";
import { useRouter } from "expo-router";

export default function AuthLayout() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;
      if (user) {
        let route;
        if (role === "master") {
          route = "/(main)/master/home";
        } else if (role === "user") {
          route = "/(main)/teacher/home";
        }
        if (route) {
          await router.replace(route);
        }
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
