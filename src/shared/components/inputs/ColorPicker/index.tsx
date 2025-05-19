import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { theme } from "../../../theme/theme";
import { PRESET_COLORS } from "./constants";
import type { ColorPickerProps } from "./types";

/**
 * カラーピッカーコンポーネント
 * プリセットされた色から選択するためのモーダルUIを提供します
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  visible,
  onClose,
  onSelectColor,
  initialColor = PRESET_COLORS[0],
}) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    onSelectColor(color);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>色を選択</Text>
          <ScrollView style={styles.colorList}>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => handleSelectColor(color)}
                />
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.surface || "#fff",
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    width: "80%",
    maxHeight: "80%",
  },
  title: {
    fontSize: theme.typography.fontSize.large,
    fontWeight: "700", // Bold
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  colorList: {
    maxHeight: 300,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
  closeButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: "#f5f5f5",
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
  },
  closeButtonText: {
    color: theme.colors.text?.primary || "#333",
    fontSize: theme.typography.fontSize.medium,
  },
});

// デフォルトエクスポートを追加
export default ColorPicker;
