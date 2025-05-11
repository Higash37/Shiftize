import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { ShiftStatusConfig, DEFAULT_SHIFT_STATUS_CONFIG } from "@/types/shift";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import { ColorPicker } from "@/components/ColorPicker";

export default function ShiftStatusSettingsScreen() {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const handleColorChange = async (status: string, newColor: string) => {
    try {
      // Firestoreの設定を更新
      const configRef = doc(db, "settings", "shiftStatus");
      await updateDoc(configRef, {
        [status]: {
          ...statusConfigs.find((c) => c.status === status),
          color: newColor,
        },
      });

      // ローカルの状態を更新
      setStatusConfigs((prev) =>
        prev.map((config) =>
          config.status === status ? { ...config, color: newColor } : config
        )
      );
    } catch (error) {
      console.error("Error updating status color:", error);
    }
  };

  const openColorPicker = (status: string) => {
    setSelectedStatus(status);
    setIsColorPickerVisible(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "シフトステータス設定",
          headerShown: true,
        }}
      />
      <ScrollView style={styles.scrollView}>
        {statusConfigs.map((config) => (
          <View key={config.status} style={styles.statusItem}>
            <View style={styles.statusHeader}>
              <View
                style={[styles.colorPreview, { backgroundColor: config.color }]}
              />
              <Text style={styles.statusLabel}>{config.label}</Text>
            </View>
            <Text style={styles.description}>{config.description}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.colorButton}
                onPress={() => openColorPicker(config.status)}
              >
                <Text style={styles.colorButtonText}>色を変更</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <ColorPicker
        visible={isColorPickerVisible}
        onClose={() => setIsColorPickerVisible(false)}
        onSelectColor={(color) => {
          if (selectedStatus) {
            handleColorChange(selectedStatus, color);
          }
        }}
        initialColor={
          selectedStatus
            ? statusConfigs.find((c) => c.status === selectedStatus)?.color
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  colorButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  colorButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});
