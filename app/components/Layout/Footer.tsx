import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import Toast from "react-native-toast-message";
import {
  MaterialIcons,
  AntDesign,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { colors } from "@/constants/theme";

const TABS = [
  {
    name: "home",
    label: "ホーム",
    path: "/teacher/home",
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
    name: "tasks",
    label: "タスク",
    path: "/teacher/tasks",
    icon: (active: boolean) => (
      <MaterialIcons
        name="assignment"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: true,
  },
  {
    name: "create",
    label: "シフト追加",
    path: "/teacher/shifts/create",
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
    path: "/teacher/shifts",
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
    name: "info",
    label: "情報",
    path: "/teacher/info",
    icon: (active: boolean) => (
      <Ionicons
        name="information-circle"
        size={24}
        color={active ? colors.primary : colors.text.secondary}
      />
    ),
    isUnderDevelopment: true,
  },
];

export function Footer() {
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
    backgroundColor: colors.primary,
    borderRadius: 50,
    marginHorizontal: 10,
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
    color: "white",
  },
  disabledLabel: {
    color: colors.text.disabled,
  },
  addButtonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 8,
  },
});

export default Footer;
