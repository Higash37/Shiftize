
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  MaterialIcons,
  AntDesign,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { createFooterStyles } from "./LayoutFooter.styles";
import { TabItem } from "./ui-layout-types";
import { FooterProps } from "./LayoutFooter.types";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { ShiftSubmissionPeriod } from "@/services/interfaces/IShiftSubmissionService";
import { useAuth } from "@/services/auth/useAuth";
import { convertShadowForWeb } from "@/common/common-constants/ShadowConstants";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { MD3ColorScheme } from "@/common/common-theme/md3/MD3Colors";

import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;

const createUserTabs = (cs: MD3ColorScheme): TabItem[] => [
  {
    name: "home",
    label: "ホーム",
    path: "/user/home",
    icon: (active: boolean) => (
      <MaterialIcons
        name="home"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "create",
    label: "シフト追加",
    path: "/user/shifts/create",
    icon: (active: boolean) => (
      <AntDesign
        name="plus"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "shifts",
    label: "シフト",
    path: "/user/shifts",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar-alt"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? cs.primary : cs.onSurfaceVariant}
      />
    ),
    isUnderDevelopment: false,
  },
];

function isStandalonePWA() {
  if (globalThis.window !== undefined) {
    return (
      globalThis.window.matchMedia("(display-mode: standalone)").matches ||
      (globalThis.window.navigator as any).standalone === true
    );
  }
  return false;
}

export function Footer(_props: Readonly<FooterProps>) {

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const styles = useThemedStyles(createFooterStyles);
  const { colorScheme } = useMD3Theme();
  const userTabs = useMemo(() => createUserTabs(colorScheme), [colorScheme]);
  useExtendedFonts();

  const [period, setPeriod] = useState<ShiftSubmissionPeriod | null>(null);

  useEffect(() => {
    if (user?.storeId) {
      loadActivePeriod();
    }
  }, [user?.storeId]);

  const loadActivePeriod = async () => {
    try {
      const periods = await ServiceProvider.shiftSubmissions.getActivePeriods(
        user?.storeId || ""
      );
      setPeriod(periods?.[0] ?? null);
    } catch (error) {

    }
  };

  const getDaysUntilDeadline = (): number => {
    if (!period) return 0;
    return ServiceProvider.shiftSubmissions.getDaysUntilDeadline(period);
  };

  const isWithinPeriod = (): boolean => {
    if (!period) return false;
    return ServiceProvider.shiftSubmissions.isWithinPeriod(period);
  };

  const handleTabPress = (tab: TabItem) => {
    if (tab.isUnderDevelopment) {
      Alert.alert("開発中です！", "この機能は現在開発中です。");
      return;
    }

    if (tab.name === "create" && period) {
      const canSubmit = isWithinPeriod();
      const daysLeft = getDaysUntilDeadline();

      if (!canSubmit) {
        Alert.alert(
          "募集期間外です",
          daysLeft < 0 ? "募集期間が終了しています" : "まだ募集期間ではありません",
        );
        return;
      }
    }

    router.replace(tab.path);
  };

  return (
    <>
      <View style={styles.footer}>
        {userTabs.map((tab, _index) => {

          const active = tab.name === "shifts"
            ? pathname.startsWith(tab.path)
            : pathname === tab.path;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, tab.isUnderDevelopment && styles.disabledTab]}
              onPress={() => handleTabPress(tab)}
              disabled={tab.isUnderDevelopment}
            >
              <View style={{ position: "relative" }}>
                {tab.icon(active)}
              </View>
              <Text
                style={[
                  styles.label,
                  active && styles.activeLabel,
                  tab.isUnderDevelopment && styles.disabledLabel,
                ]}
              >
                {tab.label}
              </Text>

              {}
              {tab.name === "create" && period && (
                <View
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: [{ translateX: -30 }],
                    backgroundColor: "#FF9800",
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    ...convertShadowForWeb({
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: -2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                      elevation: 6,
                    }),
                    zIndex: 1000,
                    marginBottom: 8,
                  }}
                >
                  {}
                  <View
                    style={{
                      position: "absolute",
                      bottom: -6,
                      left: "50%",
                      marginLeft: -6,
                      width: 0,
                      height: 0,
                      borderLeftWidth: 6,
                      borderRightWidth: 6,
                      borderTopWidth: 6,
                      borderLeftColor: "transparent",
                      borderRightColor: "transparent",
                      borderTopColor: "#FF9800",
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Ionicons name="time-outline" size={12} color="#fff" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#fff",
                      }}
                    >
                      {(() => {
                        if (isWithinPeriod()) {
                          return `締切まで ${getDaysUntilDeadline()}日`;
                        }
                        const daysLeft = getDaysUntilDeadline();
                        return daysLeft < 0 ? "募集期間終了" : "募集期間外";
                      })()}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {isStandalonePWA() && Platform.OS === "web" && (
        <View
          style={{
            height: 10,
            width: "100%",
            backgroundColor: colorScheme.surfaceContainer,
          }}
        />
      )}
    </>
  );
}

export default Footer;
