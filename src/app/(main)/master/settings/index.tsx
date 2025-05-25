import React from "react";
import { useRouter } from "expo-router";
import { SettingsIndexView } from "@/modules/master-view/settings/SettingsIndexView";

export default function MasterSettingsIndex() {
  const router = useRouter();
  return <SettingsIndexView onNavigate={router.push} />;
}
