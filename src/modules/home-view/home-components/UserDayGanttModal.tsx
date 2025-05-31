import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from "react-native";
import { styles as ganttStyles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";

interface UserDayGanttModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  times: string[];
  sampleSchedule: SampleScheduleColumn[];
}

export const UserDayGanttModal: React.FC<UserDayGanttModalProps> = ({
  visible,
  onClose,
  userName,
  times,
  sampleSchedule,
}) => {
  // ユーザーのその日の全シフトを抽出
  const userSlots = sampleSchedule
    .flatMap((col) => col.slots)
    .filter((s) => s.name === userName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={modalStyles.content}>
              <Text style={modalStyles.title}>
                {userName} の1日ガントチャート
              </Text>
              {/* 詳細スロットリスト表示（1分刻みもOK） */}
              {userSlots.length > 0 ? (
                <ScrollView
                  style={{
                    width: "100%",
                    marginBottom: 16,
                    maxHeight: 220,
                  }}
                >
                  {userSlots.map((slot, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#1976d2",
                          fontWeight: "bold",
                          minWidth: 90,
                        }}
                      >
                        {slot.start}~{slot.end}
                      </Text>
                      <Text
                        style={{
                          color: "#333",
                          fontSize: 15,
                          marginLeft: 8,
                        }}
                      >
                        {slot.task}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ color: "#888", marginBottom: 16 }}>
                  この日の業務はありません
                </Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
    color: "#1976d2",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 32,
  },
  activeRow: {
    backgroundColor: "#e3f2fd",
  },
  time: {
    width: 60,
    color: "#1976d2",
    fontWeight: "bold",
    fontSize: 15,
  },
  task: {
    color: "#333",
    fontSize: 15,
    marginLeft: 8,
  },
});
