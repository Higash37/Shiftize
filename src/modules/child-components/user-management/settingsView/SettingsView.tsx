import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import { Footer } from "@/common/common-ui/ui-layout";
import { settingsViewStyles as styles } from "./SettingsView.styles";
import type { SettingsViewProps } from "./SettingsView.types";

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  role,
  onLogout,
  onUserManage,
}) => {
  const menuItems = [
    ...(role === "master"
      ? [
          {
            label: "ユーザー管理",
            onPress: onUserManage,
            icon: "👥",
          },
        ]
      : []),
    {
      label: "ログアウト",
      onPress: onLogout,
      icon: "🚪",
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="設定" />
      <View style={styles.content}>
        <View style={styles.debugInfo}>
          <Text>UID: {user?.uid}</Text>
          <Text>Role: {user?.role}</Text>
          <Text>Nickname: {user?.nickname}</Text>
        </View>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Footer />
    </View>
  );
};
