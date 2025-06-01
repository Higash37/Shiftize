import React from "react";
import { useRouter } from "expo-router";
import { SettingsIndexView } from "@/modules/master-view/settings/settingIndexView/SettingsIndexView";
import { MasterHeader } from "@/common/common-ui/ui-layout";

export default function MasterSettingsIndex() {
  const router = useRouter();
  return (
    <>
      <MasterHeader title="設定" />
      <SettingsIndexView onNavigate={router.push} />
    </>
  );
}
