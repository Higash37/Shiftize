import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { settingsIndexViewStyles as styles } from "./SettingsIndexView.styles";
import type { SettingsIndexViewProps } from "./SettingsIndexView.types";

export const SettingsIndexView: React.FC<SettingsIndexViewProps> = ({
  onNavigate,
}) => {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "設定", headerShown: false }} />
      <Text style={styles.title}>設定</Text>
      <View style={styles.listContainer}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onNavigate("/master/settings/shift-rule")}
        >
          <Text style={styles.listText}>シフトルール</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onNavigate("/master/settings/shift-holiday")}
        >
          <Text style={styles.listText}>祝日・特別日</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onNavigate("/master/settings/shift-appearance")}
        >
          <Text style={styles.listText}>外観</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onNavigate("/master/settings/shift-status")}
        >
          <Text style={styles.listText}>シフトステータス</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => onNavigate("/master/taskManagement")}
        >
          <Text style={styles.listText}>タスク管理</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
