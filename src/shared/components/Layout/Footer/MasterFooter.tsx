import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { colors } from "@/shared/constants/theme";
import Toast from "react-native-toast-message";
import { styles } from "./styles";
import { TabItem } from "../types";
import { MasterFooterProps } from "./types";

// 管理者用フッターのタブ設定
const MASTER_TABS: TabItem[] = [
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
    name: "info",
    label: "インフォ",
    path: "/master/info",
    icon: (active: boolean) => (
      <Ionicons
        name="information-circle"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "thisMonth",
    label: "今月のシフト",
    path: "/master/gantt-view",
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
    name: "nextMonth",
    label: "来月シフト作成",
    path: "/master/gantt-edit",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar"
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

/**
 * MasterFooter - 管理者用フッターナビゲーションコンポーネント
 *
 * 管理者画面の下部に表示され、主要な画面間のナビゲーションを提供します。
 */
export function MasterFooter({}: MasterFooterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (tab: TabItem) => {
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
      {MASTER_TABS.map((tab) => {
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

export default MasterFooter;
