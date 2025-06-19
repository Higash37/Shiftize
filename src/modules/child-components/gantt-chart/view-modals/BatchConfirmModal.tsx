import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

interface BatchConfirmModalProps {
  visible: boolean;
  type: "approve" | "delete" | null;
  shifts: any[];
  isLoading: boolean;
  styles: any;
  setBatchModal: (modal: {
    visible: boolean;
    type: "approve" | "delete" | null;
  }) => void;
  setIsLoading: (loading: boolean) => void;
}

const BatchConfirmModal: React.FC<BatchConfirmModalProps> = ({
  visible,
  type,
  shifts,
  isLoading,
  styles,
  setBatchModal,
  setIsLoading,
}) => {
  if (!visible) return null;

  const title =
    type === "approve" ? "一括承認" : type === "delete" ? "完全削除" : "";

  const description =
    type === "approve"
      ? (() => {
          const targets = shifts.filter((s) => s.status === "pending");
          return `${targets.length}件の未承認シフトを一括で承認します。本当によろしいですか？`;
        })()
      : type === "delete"
      ? (() => {
          const targets = shifts.filter((s) => s.status === "deleted");
          return `${targets.length}件の削除済みシフトを画面から消します。本当によろしいですか？`;
        })()
      : "";

  const handleConfirm = async () => {
    setIsLoading(true);
    if (type === "approve") {
      const targets = shifts.filter((s) => s.status === "pending");
      try {
        for (const shift of targets) {
          await updateDoc(doc(db, "shifts", shift.id), {
            status: "approved",
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        setIsLoading(false);
        setBatchModal({ visible: false, type: null });
        return;
      }
    } else if (type === "delete") {
      const targets = shifts.filter((s) => s.status === "deletion_requested");
      try {
        for (const shift of targets) {
          await updateDoc(doc(db, "shifts", shift.id), {
            status: "deleted",
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        setIsLoading(false);
        setBatchModal({ visible: false, type: null });
        return;
      }
    }
    setIsLoading(false);
    setBatchModal({ visible: false, type: null });
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setBatchModal({ visible: false, type: null })}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonText}>確認</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BatchConfirmModal;
