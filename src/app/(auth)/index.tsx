import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { OnboardingStorage } from "@/services/storage/onboarding";

export default function AuthIndex() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log("オンボーディング状態をチェック中...");
      const completed = await OnboardingStorage.isOnboardingCompleted();
      console.log("オンボーディング完了状態:", completed);
      setIsOnboardingCompleted(completed);
    };

    checkOnboardingStatus();
  }, []);

  // ローディング中は何も表示しない
  if (isOnboardingCompleted === null) {
    return null;
  }

  // オンボーディングが完了していない場合はオンボーディング画面へ
  if (!isOnboardingCompleted) {
    console.log("オンボーディング画面にリダイレクト");
    return <Redirect href="/(auth)/onboarding" />;
  }

  // オンボーディングが完了している場合はウェルカム画面へ
  console.log("ウェルカム画面にリダイレクト");
  return <Redirect href="/(auth)/welcome" />;
}
