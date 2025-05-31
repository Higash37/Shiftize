import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { User } from "@/common/common-models/ModelIndex";
import HomeCommonScreen from "../../modules/home-view/home-screens/HomeCommonScreen";

export default function HomePage() {
  const { user } = useAuth() as { user: User | null };

  useEffect(() => {
    router.replace("/(main)/user/home");
  }, [user]);

  return <HomeCommonScreen />;
}
