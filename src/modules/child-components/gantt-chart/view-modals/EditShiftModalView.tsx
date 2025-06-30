import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";

interface EditShiftModalViewProps {
  visible: boolean;
  newShiftData: any;
  users: { uid: string; nickname: string }[];
  timeOptions: string[];
  statusConfigs: any[];
  isLoading: boolean;
  styles: any;
  onChange: (field: string, value: any) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (shift: any) => void;
}

interface ClassTime {
  startTime: string;
  endTime: string;
}

// ステータスピッカーはroleがmasterのときのみ表示、それ以外は非表示
export const EditShiftModalView: React.FC<EditShiftModalViewProps> = (
  props
) => {
  const { user, role } = useAuth();
  const {
    visible,
    newShiftData,
    users,
    timeOptions,
    statusConfigs,
    isLoading,
    styles,
    onChange,
    onClose,
    onSave,
    onDelete,
  } = props;

  const [isAddingClassTime, setIsAddingClassTime] = React.useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {isAddingClassTime ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
            >
              <Text style={styles.modalTitle}>授業時間を追加</Text>

              {(newShiftData.classes || []).map(
                (classTime: ClassTime, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeInputLabel}>開始</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={classTime.startTime}
                          onValueChange={(v) => {
                            const updated = [...(newShiftData.classes || [])];
                            updated[idx] = { ...updated[idx], startTime: v };
                            onChange("classes", updated);
                          }}
                          style={styles.picker}
                        >
                          {timeOptions.map((time) => (
                            <Picker.Item key={time} label={time} value={time} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    <Text style={styles.timeInputSeparator}>～</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timeInputLabel}>終了</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={classTime.endTime}
                          onValueChange={(v) => {
                            const updated = [...(newShiftData.classes || [])];
                            updated[idx] = { ...updated[idx], endTime: v };
                            onChange("classes", updated);
                          }}
                          style={styles.picker}
                        >
                          {timeOptions.map((time) => (
                            <Picker.Item key={time} label={time} value={time} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{ marginLeft: 8 }}
                      onPress={() => {
                        const updated = [...(newShiftData.classes || [])];
                        updated.splice(idx, 1);
                        onChange("classes", updated);
                      }}
                    >
                      <Text style={{ color: "#FF4444", fontWeight: "bold" }}>
                        削除
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              )}

              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: "flex-start" }}
                onPress={() => {
                  const updated = [...(newShiftData.classes || [])];
                  updated.push({
                    startTime: newShiftData.startTime,
                    endTime: newShiftData.endTime,
                  });
                  onChange("classes", updated);
                }}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  ＋授業時間を追加
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 20, alignSelf: "center" }}
                onPress={() => setIsAddingClassTime(false)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  スタッフ編集に戻る
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
              <Text style={styles.modalTitle}>シフト編集</Text>
              <Text style={styles.modalSubtitle}>{newShiftData.date}</Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ユーザー</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newShiftData.userId}
                    onValueChange={(itemValue) => {
                      const user = users.find((u) => u.uid === itemValue);
                      onChange("userId", itemValue);
                      onChange("nickname", user ? user.nickname : "未選択");
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="ユーザーを選択" value="" />
                    {users.map((user) => (
                      <Picker.Item
                        key={user.uid}
                        label={user.nickname}
                        value={user.uid}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.timeInputContainer}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>開始時間</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.startTime}
                      onValueChange={(itemValue) =>
                        onChange("startTime", itemValue)
                      }
                      style={styles.picker}
                    >
                      {timeOptions.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <Text style={styles.timeInputSeparator}>～</Text>

                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>終了時間</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.endTime}
                      onValueChange={(itemValue) =>
                        onChange("endTime", itemValue)
                      }
                      style={styles.picker}
                    >
                      {timeOptions.map((time) => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {role === "master" && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>ステータス</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={newShiftData.status}
                      onValueChange={(itemValue) =>
                        onChange("status", itemValue)
                      }
                      style={styles.picker}
                    >
                      {statusConfigs.map((config) => (
                        <Picker.Item
                          key={config.status}
                          label={config.label}
                          value={config.status}
                        />
                      ))}
                      <Picker.Item label="完了" value="completed" />
                    </Picker>
                    <Text
                      style={[
                        styles.formLabel,
                        { color: "#FF4444", fontWeight: "bold", fontSize: 12 },
                      ]}
                    >
                      ・講師を変える場合は新しく追加しなおした後このシフトを削除してください。
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={{ marginBottom: 10, alignSelf: "center" }}
                onPress={() => setIsAddingClassTime(true)}
              >
                <Text style={{ color: "#4A90E2", fontWeight: "bold" }}>
                  授業時間を追加
                </Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "#FF4444", marginRight: 8 },
                  ]}
                  onPress={() => onDelete(newShiftData)}
                  disabled={isLoading}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    削除
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={onSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>更新</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
