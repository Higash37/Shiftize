import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  query,
  where,
  getDocs,
  setDoc,
  getFirestore,
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import TimeSelect from "@/modules/shift-ui/shift-ui-components/TimeSelect";
import CalendarModal from "@/modules/calendar/calendar-components/calendar-modal/CalendarModal";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import type {
  Shift,
  ShiftStatus,
  ShiftType,
} from "@/common/common-models/ModelIndex";
import { useAuth } from "@/services/auth/useAuth";
import type { ExtendedUser } from "@/modules/user-management/user-types/components";
import { Header } from "@/common/common-ui/ui-layout";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getUserData, type UserData } from "@/services/firebase/firebase";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

interface ShiftData {
  startTime: string;
  endTime: string;
  dates: string[];
  hasClass: boolean;
  classes: Array<{
    startTime: string;
    endTime: string;
  }>;
}

interface ShiftCreateFormProps {
  initialMode?: string;
  initialShiftId?: string;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialClasses?: string;
}

export const ShiftCreateForm: React.FC<ShiftCreateFormProps> = ({
  initialMode,
  initialShiftId,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialClasses,
}) => {
  const router = useRouter();
  const { markShiftAsDeleted, createShift } = useShift();
  const isEditMode = initialMode === "edit";
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: initialStartTime || "",
    endTime: initialEndTime || "",
    dates: initialDate ? [initialDate] : [],
    hasClass: initialClasses ? JSON.parse(initialClasses).length > 0 : false,
    classes: initialClasses ? JSON.parse(initialClasses) : [],
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const [selectedStartTime, setSelectedStartTime] = useState(
    initialStartTime || ""
  );
  const [selectedEndTime, setSelectedEndTime] = useState(initialEndTime || "");
  const [selectedClasses, setSelectedClasses] = useState<any[]>(() => {
    if (initialClasses) {
      try {
        return JSON.parse(initialClasses);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // ユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
        if (isEditMode && initialShiftId) {
          const shiftDoc = await getDoc(doc(db, "shifts", initialShiftId));
          if (shiftDoc.exists()) {
            setExistingShift(shiftDoc.data() as Shift);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, isEditMode, initialShiftId]);
  // 既存のシフトデータがある場合、それを使用してフォームを初期化
  useEffect(() => {
    if (existingShift) {
      setShiftData({
        startTime: existingShift.startTime,
        endTime: existingShift.endTime,
        dates: [existingShift.date],
        hasClass: Boolean(
          existingShift.classes && existingShift.classes.length > 0
        ),
        classes: existingShift.classes || [],
      });
      setSelectedDate(existingShift.date);
      setSelectedStartTime(existingShift.startTime);
      setSelectedEndTime(existingShift.endTime);
      setSelectedClasses(existingShift.classes || []);
    }
  }, [existingShift]);

  const handleTimeChange = (
    type: "start" | "end" | "classStart" | "classEnd",
    value: string,
    index?: number
  ) => {
    if (type === "start") {
      setShiftData((prev) => ({
        ...prev,
        startTime: value,
      }));
      setSelectedStartTime(value);
    } else if (type === "end") {
      setShiftData((prev) => ({
        ...prev,
        endTime: value,
      }));
      setSelectedEndTime(value);
    } else if (type === "classStart" && index !== undefined) {
      const updatedClasses = [...shiftData.classes];
      updatedClasses[index] = {
        ...updatedClasses[index],
        startTime: value,
      };
      setShiftData((prev) => ({
        ...prev,
        classes: updatedClasses,
      }));
      setSelectedClasses(updatedClasses);
    } else if (type === "classEnd" && index !== undefined) {
      const updatedClasses = [...shiftData.classes];
      updatedClasses[index] = {
        ...updatedClasses[index],
        endTime: value,
      };
      setShiftData((prev) => ({
        ...prev,
        classes: updatedClasses,
      }));
      setSelectedClasses(updatedClasses);
    }
  };

  const handleDateSelect = (date: string) => {
    setShiftData((prev) => ({
      ...prev,
      dates: [date],
    }));
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const addClass = () => {
    const defaultStartTime = selectedStartTime;
    const defaultEndTime = selectedEndTime;
    const newClass = {
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    };
    setShiftData((prev) => ({
      ...prev,
      hasClass: true,
      classes: [...prev.classes, newClass],
    }));
    setSelectedClasses((prev) => [...prev, newClass]);
  };

  const removeClass = (index: number) => {
    const updatedClasses = [...shiftData.classes];
    updatedClasses.splice(index, 1);
    setShiftData((prev) => ({
      ...prev,
      hasClass: updatedClasses.length > 0,
      classes: updatedClasses,
    }));
    setSelectedClasses(updatedClasses);
  };

  const validateShift = () => {
    if (!selectedDate) {
      setErrorMessage("日付を選択してください");
      return false;
    }
    if (!shiftData.startTime) {
      setErrorMessage("開始時間を選択してください");
      return false;
    }
    if (!shiftData.endTime) {
      setErrorMessage("終了時間を選択してください");
      return false;
    }

    // 開始時間と終了時間の比較
    const startTimeDate = new Date(`2000-01-01T${shiftData.startTime}`);
    const endTimeDate = new Date(`2000-01-01T${shiftData.endTime}`);
    if (startTimeDate >= endTimeDate) {
      setErrorMessage("終了時間は開始時間より後である必要があります");
      return false;
    }

    // 授業時間の検証
    for (let i = 0; i < shiftData.classes.length; i++) {
      const classItem = shiftData.classes[i];
      const classStartTime = new Date(`2000-01-01T${classItem.startTime}`);
      const classEndTime = new Date(`2000-01-01T${classItem.endTime}`);

      if (classStartTime >= classEndTime) {
        setErrorMessage(
          `授業${i + 1}の終了時間は開始時間より後である必要があります`
        );
        return false;
      }

      if (classStartTime < startTimeDate || classEndTime > endTimeDate) {
        setErrorMessage(`授業${i + 1}の時間はシフト時間内である必要があります`);
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  const handleCreateOrUpdateShift = async () => {
    if (!validateShift() || !user) return;

    try {
      setIsLoading(true);

      const shiftObject: any = {
        userId: user.uid,
        date: selectedDate,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        status: isEditMode ? existingShift?.status || "pending" : "pending",
        classes: shiftData.classes,
        updatedAt: serverTimestamp(),
      };

      if (!isEditMode) {
        shiftObject.createdAt = serverTimestamp();
      }

      let result;
      if (isEditMode && initialShiftId) {
        // 更新
        const shiftRef = doc(db, "shifts", initialShiftId);
        await updateDoc(shiftRef, shiftObject);
        result = { id: initialShiftId };
      } else {
        // 新規作成
        const shiftsCollectionRef = collection(db, "shifts");
        result = await addDoc(shiftsCollectionRef, shiftObject);
      }

      setIsLoading(false);
      setShowSuccess(true);

      // 成功アニメーションを表示
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 一定時間後に前の画面に戻る
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error creating/updating shift:", error);
      setIsLoading(false);
      setErrorMessage("シフトの保存中にエラーが発生しました");
    }
  };

  const handleDeleteShift = async () => {
    if (!isEditMode || !initialShiftId) return;

    Alert.alert("シフトを削除", "このシフトを削除しますか？", [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true);
            await markShiftAsDeleted(initialShiftId);
            setIsLoading(false);
            router.back();
          } catch (error) {
            console.error("Error deleting shift:", error);
            setIsLoading(false);
            setErrorMessage("シフトの削除中にエラーが発生しました");
          }
        },
      },
    ]);
  };
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title={isEditMode ? "シフト編集" : "シフト作成"}
          showBackButton
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={isEditMode ? "シフト編集" : "シフト作成"}
        showBackButton
        onBack={() => router.back()}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* 日付選択 */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>日付</Text>
            <TouchableOpacity
              style={styles.dateSelectButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.dateSelectText}>
                {selectedDate
                  ? format(new Date(selectedDate), "yyyy年M月d日(E)", {
                      locale: ja,
                    })
                  : "日付を選択"}
              </Text>
              <AntDesign name="calendar" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* 時間選択 */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>時間</Text>
            <View style={styles.timeContainer}>
              <View style={styles.timeSelectContainer}>
                <Text style={styles.timeLabel}>開始</Text>
                <TimeSelect
                  value={shiftData.startTime}
                  onChange={(value) => handleTimeChange("start", value)}
                />
              </View>
              <Text style={styles.timeSeparator}>～</Text>
              <View style={styles.timeSelectContainer}>
                <Text style={styles.timeLabel}>終了</Text>
                <TimeSelect
                  value={shiftData.endTime}
                  onChange={(value) => handleTimeChange("end", value)}
                />
              </View>
            </View>
          </View>

          {/* 授業設定 */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>授業</Text>
              <TouchableOpacity style={styles.addButton} onPress={addClass}>
                <AntDesign
                  name="plus"
                  size={IS_SMALL_DEVICE ? 16 : 20}
                  color="white"
                />
                <Text style={styles.addButtonText}>授業を追加</Text>
              </TouchableOpacity>
            </View>

            {shiftData.classes.length > 0 ? (
              <View style={styles.classesList}>
                {shiftData.classes.map((classItem, index) => (
                  <View key={index} style={styles.classItem}>
                    <View style={styles.classHeader}>
                      <Text style={styles.classTitle}>授業 {index + 1}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeClass(index)}
                      >
                        {" "}
                        <AntDesign
                          name="close"
                          size={IS_SMALL_DEVICE ? 16 : 20}
                          color={colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.classTimeContainer}>
                      <View style={styles.timeSelectContainer}>
                        <Text style={styles.timeLabel}>開始</Text>
                        <TimeSelect
                          value={classItem.startTime}
                          onChange={(value) =>
                            handleTimeChange("classStart", value, index)
                          }
                        />
                      </View>
                      <Text style={styles.timeSeparator}>～</Text>
                      <View style={styles.timeSelectContainer}>
                        <Text style={styles.timeLabel}>終了</Text>
                        <TimeSelect
                          value={classItem.endTime}
                          onChange={(value) =>
                            handleTimeChange("classEnd", value, index)
                          }
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noClassContainer}>
                <Text style={styles.noClassText}>
                  授業がありません。追加してください。
                </Text>
              </View>
            )}
          </View>

          {/* エラーメッセージ */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* 送信ボタン */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateOrUpdateShift}
            >
              <Text style={styles.submitButtonText}>
                {isEditMode ? "更新する" : "作成する"}
              </Text>
            </TouchableOpacity>

            {/* 編集モードの場合のみ削除ボタンを表示 */}
            {isEditMode && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteShift}
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>{" "}
      {/* 日付選択モーダル */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={(dates: string[]) => {
          if (dates.length > 0) {
            handleDateSelect(dates[0]);
          }
        }}
        initialDates={selectedDate ? [selectedDate] : []}
      />
      {/* 成功メッセージ */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <AntDesign name="checkcircle" size={48} color="white" />
          <Text style={styles.successText}>
            {isEditMode ? "更新しました" : "作成しました"}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: IS_SMALL_DEVICE ? 12 : 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text.primary,
  },
  dateSelectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  dateSelectText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.primary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSelectContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    marginBottom: 4,
    color: colors.text.secondary,
  },
  timeSeparator: {
    marginHorizontal: 12,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    color: colors.text.secondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: "white",
    marginLeft: 4,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
  },
  classesList: {
    marginTop: 8,
  },
  classItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  classTitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  removeButton: {
    padding: 4,
  },
  classTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  noClassContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  noClassText: {
    color: colors.text.secondary,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: colors.error + "20",
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: IS_SMALL_DEVICE ? 12 : 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  submitButtonText: {
    color: "white",
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "white",
    padding: IS_SMALL_DEVICE ? 12 : 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
  },
  successContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
});
