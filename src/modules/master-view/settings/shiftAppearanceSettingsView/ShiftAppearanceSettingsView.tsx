import React from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { shiftAppearanceSettingsViewStyles as styles } from "./ShiftAppearanceSettingsView.styles";
import type { ShiftAppearanceSettingsViewProps } from "./ShiftAppearanceSettingsView.types";

export const ShiftAppearanceSettingsView: React.FC<
  ShiftAppearanceSettingsViewProps
> = ({ settings, loading, onChange, onSave }) => {
  if (loading)
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "外観設定", headerShown: true }} />
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>外観</Text>
        <View style={styles.listItem}>
          <Text style={styles.listText}>ダークモード</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={(v) => onChange({ ...settings, darkMode: v })}
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
