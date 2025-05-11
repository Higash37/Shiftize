import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";

interface ColorPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  initialColor?: string;
}

const PRESET_COLORS = [
  "#FFD700", // 申請中（黄色）
  "#90caf9", // 承認済み（青）
  "#ffcdd2", // 却下（赤）
  "#FFA500", // 削除申請中（オレンジ）
  "#9e9e9e", // 削除済み（グレー）
  "#4CAF50", // 緑
  "#2196F3", // 青
  "#F44336", // 赤
  "#FFC107", // 黄
  "#9C27B0", // 紫
  "#00BCD4", // 水色
  "#FF9800", // オレンジ
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  visible,
  onClose,
  onSelectColor,
  initialColor = "#FFD700",
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
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "80%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  colorList: {
    maxHeight: 300,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
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
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
  },
});
