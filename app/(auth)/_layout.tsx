import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../providers/AuthContext";
import { useRouter } from "expo-router";

export default function AuthLayout() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (user) {
        const route =
          userRole === "master" ? "/(main)/master" : "/(main)/shifts";
        await router.replace(route);
      }
    };

    checkAuth();
  }, [user, userRole, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  );
}
