import React from "react";
import ChangePassword from "@/modules/child-components/user-management/user-props/ChangePassword";
import { useRouter } from "expo-router";

const ChangePasswordScreen = () => {
  const router = useRouter();
  return <ChangePassword onComplete={() => router.back()} />;
};

export default ChangePasswordScreen;
