import React from "react";
import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import Toast from "react-native-toast-message";
import {
  MaterialIcons,
  AntDesign,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { styles } from "./styles";
import { TabItem } from "../types";
import { FooterProps } from "./types";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

// 講師用フッターのタブ設定
const user_TABS: TabItem[] = [
  {
    name: "home",
    label: "ホーム",
    path: "/user/home",
    icon: (active: boolean) => (
      <MaterialIcons
        name="home"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "tasks",
    label: "タスク",
    path: "/user/tasks",
    icon: (active: boolean) => (
      <MaterialIcons
        name="assignment"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: true,
  },
  {
    name: "create",
    label: "シフト追加",
    path: "/user/shifts/create",
    icon: (active: boolean) => (
      <View style={styles.addButtonContainer}>
        <AntDesign name="plus" size={IS_SMALL_DEVICE ? 20 : 24} color="white" />
      </View>
    ),
    isUnderDevelopment: false,
  },
  {
    name: "shifts",
    label: "シフト",
    path: "/user/shifts/",
    icon: (active: boolean) => (
      <FontAwesome5
        name="calendar-alt"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: false,
  },
  {
    name: "info",
    label: "情報",
    path: "/user/info",
    icon: (active: boolean) => (
      <Ionicons
        name="information-circle"
        size={IS_SMALL_DEVICE ? 20 : 24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: true,
  },
];

/**
 * Footer - 講師用フッターナビゲーションコンポーネント
 *
 * アプリケーションの下部に表示され、主要な画面間のナビゲーションを提供します。
 */
export function Footer({}: FooterProps) {
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
      {user_TABS.map((tab) => {
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

export default Footer;
