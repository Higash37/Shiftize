import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./PrintButton.styles";
import { ShiftPrintModal } from "./ShiftPrintModal";

interface PrintButtonProps {
  shifts?: any[];
  users?: Array<{ uid: string; nickname: string; color?: string }>;
  selectedDate?: Date;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  shifts = [],
  users = [],
  selectedDate = new Date(),
}) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePrint} style={styles.printButton}>
        <Ionicons name="print-outline" size={20} color="#fff" />
        <Text style={styles.printButtonText}>印刷</Text>
      </TouchableOpacity>

      <ShiftPrintModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        shifts={shifts}
        users={users}
        selectedDate={selectedDate}
      />
    </>
  );
};
