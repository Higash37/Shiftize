import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ShiftRuleValuePicker } from "./ShiftRuleValuePicker";
import { shiftRuleSettingsViewStyles as styles } from "./ShiftRuleSettingsView.styles";
import type { ShiftRuleSettingsViewProps } from "./ShiftRuleSettingsView.types";

export const ShiftRuleSettingsView: React.FC<ShiftRuleSettingsViewProps> = ({
  settings,
  loading,
  onChange,
  onSave,
  picker,
  setPicker,
}) => {
  // 値リスト
  const maxWorkHoursList = Array.from({ length: 13 }, (_, i) => i + 6);
  const minBreakList = [30, 45, 60, 90, 120];
  const maxConsecutiveList = [3, 4, 5, 6, 7, 8, 9, 10];

  if (loading)
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: "シフトルール設定", headerShown: true }}
      />
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>シフトルール</Text>
        {/* 最大勤務時間 */}
        <View style={styles.listItemRow}>
          <Text style={styles.listText}>1日の最大勤務時間</Text>
          <View style={styles.valueRow}>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  maxWorkHours: Math.max(6, settings.maxWorkHours - 1),
                })
              }
            >
              <Ionicons
                name="remove-circle-outline"
                size={28}
                color="#1976D2"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPicker("maxWorkHours")}
              style={styles.valueTouchable}
            >
              <Text style={styles.valueText}>{settings.maxWorkHours}時間</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  maxWorkHours: Math.min(18, settings.maxWorkHours + 1),
                })
              }
            >
              <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>
        {/* 最小休憩時間 */}
        <View style={styles.listItemRow}>
          <Text style={styles.listText}>最小休憩時間</Text>
          <View style={styles.valueRow}>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  minBreakMinutes: Math.max(30, settings.minBreakMinutes - 5),
                })
              }
            >
              <Ionicons
                name="remove-circle-outline"
                size={28}
                color="#1976D2"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPicker("minBreakMinutes")}
              style={styles.valueTouchable}
            >
              <Text style={styles.valueText}>{settings.minBreakMinutes}分</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  minBreakMinutes: Math.min(120, settings.minBreakMinutes + 5),
                })
              }
            >
              <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>
        {/* 連勤制限 */}
        <View style={styles.listItemRow}>
          <Text style={styles.listText}>連勤制限</Text>
          <View style={styles.valueRow}>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  maxConsecutiveDays: Math.max(
                    3,
                    settings.maxConsecutiveDays - 1
                  ),
                })
              }
            >
              <Ionicons
                name="remove-circle-outline"
                size={28}
                color="#1976D2"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPicker("maxConsecutiveDays")}
              style={styles.valueTouchable}
            >
              <Text style={styles.valueText}>
                {settings.maxConsecutiveDays}日
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onChange({
                  ...settings,
                  maxConsecutiveDays: Math.min(
                    10,
                    settings.maxConsecutiveDays + 1
                  ),
                })
              }
            >
              <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
      {/* モーダルピッカー */}
      <ShiftRuleValuePicker
        visible={picker === "maxWorkHours"}
        values={maxWorkHoursList}
        value={settings.maxWorkHours}
        unit="時間"
        title="1日の最大勤務時間"
        onSelect={(v) => onChange({ ...settings, maxWorkHours: v })}
        onClose={() => setPicker(null)}
      />
      <ShiftRuleValuePicker
        visible={picker === "minBreakMinutes"}
        values={minBreakList}
        value={settings.minBreakMinutes}
        unit="分"
        title="最小休憩時間"
        onSelect={(v) => onChange({ ...settings, minBreakMinutes: v })}
        onClose={() => setPicker(null)}
      />
      <ShiftRuleValuePicker
        visible={picker === "maxConsecutiveDays"}
        values={maxConsecutiveList}
        value={settings.maxConsecutiveDays}
        unit="日"
        title="連勤制限"
        onSelect={(v) => onChange({ ...settings, maxConsecutiveDays: v })}
        onClose={() => setPicker(null)}
      />
    </View>
  );
};
