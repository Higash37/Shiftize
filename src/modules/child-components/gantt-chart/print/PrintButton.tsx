import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./PrintButton.styles";

export const PrintButton: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
      <Ionicons name="print-outline" size={20} color="#fff" />
      <Text style={styles.printButtonText}>印刷</Text>
    </TouchableOpacity>
  );
};
