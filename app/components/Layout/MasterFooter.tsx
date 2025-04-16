import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import Toast from "react-native-toast-message";
import { getPlatformShadow } from "@/utils/time";

const TABS = [
  {
    name: "home",
    label: "ホーム",
    path: "/master/home",
    icon: (active: boolean) => (
      <MaterialIcons
        name="home"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "users",
    label: "ユーザー管理",
    path: "/master/users",
    icon: (active: boolean) => (
      <MaterialIcons
        name="people"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "create",
    label: "シフト追加",
    path: "/master/shifts/create",
    icon: (active: boolean) => (
      <View style={styles.addButtonContainer}>
        <AntDesign name="plus" size={24} color="white" />
      </View>
    ),
    isUnderDevelopment: false,
  },
  {
    name: "shifts",
    label: "シフト",
    path: "/master/shifts",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar-alt"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "settings",
    label: "設定",
    path: "/master/settings",
    icon: (active: boolean) => (
      <Ionicons
        name="settings"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
];

export function MasterFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (tab: (typeof TABS)[0]) => {
    if (tab.isUnderDevelopment) {
      Toast.show({
        type: "info",
        text1: "開発中です！",
        text2: "この機能は現在開発中です。",
        position: "bottom",
      });
      return;
    }
    router.push(tab.path);
  };

  return (
    <View style={styles.footer}>
      {TABS.map((tab) => {
        const active = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              tab.name === "create" && styles.createTab,
              tab.isUnderDevelopment && styles.disabledTab,
            ]}
            onPress={() => handleTabPress(tab)}
            disabled={tab.isUnderDevelopment}
          >
            {tab.icon(active)}
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
                tab.name === "create" && styles.createLabel,
                tab.isUnderDevelopment && styles.disabledLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  createTab: {
    marginTop: -20,
  },
  disabledTab: {
    opacity: 0.5,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  activeLabel: {
    color: colors.primary,
  },
  createLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.text.secondary,
  },
  addButtonContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
});
