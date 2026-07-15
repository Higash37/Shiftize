

import { useRef } from "react";

import { Slot } from "expo-router";

import { useAuth } from "@/services/auth/useAuth";

import { SettingsProvider } from "@/common/common-utils/util-settings";
import { TimeSegmentTypesProvider } from "@/common/common-context/TimeSegmentTypesContext";
import { PendingShiftBadgeProvider } from "@/common/common-context/PendingShiftBadgeContext";

export default function MainLayout() {

  const { user, loading } = useAuth();

  const wasAuthenticated = useRef(false);

  if (user) {
    wasAuthenticated.current = true;
  }

  if (loading) {
    return null;
  }

  if (!user && !wasAuthenticated.current) {
    return null;
  }

  return (
    <SettingsProvider>
      <TimeSegmentTypesProvider storeId={user?.storeId || ""}>
        <PendingShiftBadgeProvider storeId={user?.storeId || ""}>
          {}
          <Slot />
        </PendingShiftBadgeProvider>
      </TimeSegmentTypesProvider>
    </SettingsProvider>
  );
}
