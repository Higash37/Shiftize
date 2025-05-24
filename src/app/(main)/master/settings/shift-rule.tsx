import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Stack } from "expo-router";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { ShiftRuleValuePicker } from "./ShiftRuleValuePicker";

export type ShiftAppSettings = {
  maxWorkHours: number;
  minBreakMinutes: number;
  maxConsecutiveDays: number;
};

const DEFAULT_SETTINGS: ShiftAppSettings = {
  maxWorkHours: 8,
  minBreakMinutes: 60,
  maxConsecutiveDays: 5,
};

export default function ShiftRuleSettingsScreen() {
  const [settings, setSettings] = useState<ShiftAppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<
    null | "maxWorkHours" | "minBreakMinutes" | "maxConsecutiveDays"
  >(null);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "settings", "shiftApp");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async (newSettings: ShiftAppSettings) => {
    setLoading(true);
    const ref = doc(db, "settings", "shiftApp");
    await setDoc(ref, newSettings, { merge: true });
    setSettings(newSettings);
    setLoading(false);
    Alert.alert("保存しました");
  };

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
                setSettings((s) => ({
                  ...s,
                  maxWorkHours: Math.max(6, s.maxWorkHours - 1),
                }))
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
                setSettings((s) => ({
                  ...s,
                  maxWorkHours: Math.min(18, s.maxWorkHours + 1),
                }))
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
                setSettings((s) => ({
                  ...s,
                  minBreakMinutes: Math.max(30, s.minBreakMinutes - 5),
                }))
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
                setSettings((s) => ({
                  ...s,
                  minBreakMinutes: Math.min(120, s.minBreakMinutes + 5),
                }))
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
                setSettings((s) => ({
                  ...s,
                  maxConsecutiveDays: Math.max(3, s.maxConsecutiveDays - 1),
                }))
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
                setSettings((s) => ({
                  ...s,
                  maxConsecutiveDays: Math.min(10, s.maxConsecutiveDays + 1),
                }))
              }
            >
              <Ionicons name="add-circle-outline" size={28} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveSettings(settings)}
        >
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
        onSelect={(v) => setSettings((s) => ({ ...s, maxWorkHours: v }))}
        onClose={() => setPicker(null)}
      />
      <ShiftRuleValuePicker
        visible={picker === "minBreakMinutes"}
        values={minBreakList}
        value={settings.minBreakMinutes}
        unit="分"
        title="最小休憩時間"
        onSelect={(v) => setSettings((s) => ({ ...s, minBreakMinutes: v }))}
        onClose={() => setPicker(null)}
      />
      <ShiftRuleValuePicker
        visible={picker === "maxConsecutiveDays"}
        values={maxConsecutiveList}
        value={settings.maxConsecutiveDays}
        unit="日"
        title="連勤制限"
        onSelect={(v) => setSettings((s) => ({ ...s, maxConsecutiveDays: v }))}
        onClose={() => setPicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
  card: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  listItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  listText: { fontSize: 16, color: "#222" },
  saveButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    alignSelf: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueTouchable: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    marginHorizontal: 4,
  },
  valueText: {
    fontSize: 18,
    color: "#1976D2",
    fontWeight: "bold",
    minWidth: 56,
    textAlign: "center",
  },
});
