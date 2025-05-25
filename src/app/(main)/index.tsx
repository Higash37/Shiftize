import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { User } from "@/common/common-models/ModelIndex";

export default function HomePage() {
  const { user } = useAuth() as { user: User | null };

  useEffect(() => {
    if (user?.role === "master") {
      router.replace("/(main)/master/home");
    } else {
      router.replace("/(main)/user/home");
    }
  }, [user]);

  return null;
}
