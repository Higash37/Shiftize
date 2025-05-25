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

export default function ShiftCreateScreen() {
  const router = useRouter();
  const { markShiftAsDeleted, createShift } = useShift();
  const { mode, shiftId, date, startTime, endTime, classes } =
    useLocalSearchParams();
  const isEditMode = mode === "edit";
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [existingShift, setExistingShift] = useState<Shift | null>(null);
  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: (startTime as string) || "",
    endTime: (endTime as string) || "",
    dates: date ? [date as string] : [],
    hasClass: classes ? JSON.parse(classes as string).length > 0 : false,
    classes: classes ? JSON.parse(classes as string) : [],
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState(date || "");
  const [selectedStartTime, setSelectedStartTime] = useState(startTime || "");
  const [selectedEndTime, setSelectedEndTime] = useState(endTime || "");
  const [selectedClasses, setSelectedClasses] = useState<any[]>(() => {
    if (classes) {
      try {
        return JSON.parse(classes as string);
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
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // 既存のシフトデータを取得
  useEffect(() => {
    const fetchShiftData = async () => {
      if (isEditMode && shiftId) {
        try {
          const shiftDoc = await getDoc(doc(db, "shifts", shiftId as string));
          if (shiftDoc.exists()) {
            const data = shiftDoc.data();
            setExistingShift({
              id: shiftDoc.id,
              userId: data.userId,
              nickname: data.nickname,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              type: data.type,
              subject: data.subject,
              isCompleted: data.isCompleted,
              status: data.status,
              duration: data.duration,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              requestedChanges: data.requestedChanges,
            });

            // 削除済みシフトの場合は編集画面を閉じる
            if (data.status === "deleted") {
              Alert.alert("編集不可", "削除済みのシフトは編集できません。", [
                {
                  text: "戻る",
                  onPress: () => router.back(),
                },
              ]);
              return;
            }

            // 編集権限チェック
            if (
              data.userId &&
              data.userId !== user?.uid &&
              userData?.role !== "master"
            ) {
              Alert.alert(
                "権限エラー",
                "このシフトを編集する権限がありません。",
                [
                  {
                    text: "戻る",
                    onPress: () => router.back(),
                  },
                ]
              );
              return;
            }

            setShiftData({
              startTime: data.startTime || "",
              endTime: data.endTime || "",
              dates: data.date ? [data.date] : [],
              hasClass: (data.classes || []).length > 0,
              classes: data.classes || [],
            });
          }
        } catch (error) {
          console.error("Error fetching shift data:", error);
          Alert.alert("エラー", "シフトデータの取得に失敗しました。");
        }
      }
    };

    fetchShiftData();
  }, [isEditMode, shiftId, user, userData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const showSuccessMessage = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
      router.replace("/(main)/teacher/shifts");
    });
  };

  // 同じ userId + date のシフトがすでにあるかどうか確認する関数
  const isDuplicateShift = async (userId: string, date: string) => {
    const q = query(
      collection(db, "shifts"),
      where("userId", "==", userId),
      where("date", "==", date)
      // Firestore によってはここに status 条件が入れられないので注意
    );
    const snapshot = await getDocs(q);

    // 「deleted」以外のステータスが既にある場合は重複とみなす
    return snapshot.docs.some((doc) => doc.data().status !== "deleted");
  };

  const calculateDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  };

  const handleSubmit = async () => {
    if (isLoading) return; // 2重送信防止

    try {
      setIsLoading(true);

      // バリデーション
      if (!user?.uid) {
        Alert.alert("エラー", "ログイン情報が取得できませんでした。");
        return;
      }

      if (
        !shiftData.startTime ||
        !shiftData.endTime ||
        shiftData.dates.length === 0
      ) {
        Alert.alert(
          "エラー",
          "開始時間・終了時間・日付をすべて入力してください。"
        );
        return;
      }

      const cleanedClasses = shiftData.classes.filter(
        (c) => c.startTime && c.endTime
      );

      // 編集モード時（1件のみ更新）
      if (isEditMode && shiftId) {
        const shiftToUpdate = {
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          date: shiftData.dates[0],
          classes: cleanedClasses,
          duration: calculateDuration(shiftData.startTime, shiftData.endTime),
          updatedAt: serverTimestamp(),
        };

        if (userData?.role === "master") {
          // マスター → 即反映
          await updateDoc(doc(db, "shifts", shiftId as string), {
            ...shiftToUpdate,
            status: "approved",
          });
        } else {
          // 講師 → 編集申請
          await updateDoc(doc(db, "shifts", shiftId as string), {
            status: "pending",
            requestedChanges: {
              ...shiftToUpdate,
              requestedAt: serverTimestamp(),
            },
            updatedAt: serverTimestamp(),
          });
        }

        router.replace("/(main)/teacher/shifts");
        return;
      }

      for (const date of shiftData.dates) {
        const isDuplicate = await isDuplicateShift(user.uid, date);
        if (isDuplicate) {
          Alert.alert("重複エラー", `${date} は既にシフトが登録されています。`);
          continue; // この日はスキップ
        }

        const shiftToSend = {
          userId: user.uid,
          nickname: userData?.nickname || "",
          date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          status: "pending" as ShiftStatus,
          type: "staff" as ShiftType,
          isCompleted: false,
          duration: calculateDuration(shiftData.startTime, shiftData.endTime),
          classes: shiftData.classes,
          hasClass: shiftData.hasClass,
        };

        await createShift(shiftToSend);
      }

      router.replace("/(main)/teacher/shifts");
    } catch (error) {
      console.error("シフトの保存に失敗しました:", error);
      Alert.alert("エラー", "シフトの保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange =
    (field: keyof Pick<ShiftData, "startTime" | "endTime">) =>
    (time: string) => {
      setShiftData((prev) => ({ ...prev, [field]: time }));
    };

  const handleDatesConfirm = (dates: string[]) => {
    setShiftData((prev) => ({ ...prev, dates }));
    setShowCalendar(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy年M月d日(E)", { locale: ja });
  };

  const handleClassTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    time: string
  ) => {
    setShiftData((prev) => ({
      ...prev,
      classes: prev.classes.map((classTime, i) =>
        i === index ? { ...classTime, [field]: time } : classTime
      ),
    }));
  };

  const addClass = () => {
    setShiftData((prev) => ({
      ...prev,
      classes: [...prev.classes, { startTime: "", endTime: "" }],
    }));
  };

  const removeClass = (index: number) => {
    setShiftData((prev) => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index),
    }));
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await updateDoc(doc(db, "shifts", shiftId as string), {
        status: "pending", // 申請待ち状態に更新
        updatedAt: serverTimestamp(),
      });
      router.replace("/(main)/teacher/shifts"); // シフト確認画面に戻る
    } catch (error) {
      console.error("シフトの削除に失敗しました:", error);
      Alert.alert("エラー", "シフトの削除に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditMode ? "シフト編集" : "シフト追加"}
        showBackButton
        onBack={() => router.back()}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>スタッフ時間</Text>
          <TimeSelect
            startTime={shiftData.startTime}
            endTime={shiftData.endTime}
            onStartTimeChange={handleTimeChange("startTime")}
            onEndTimeChange={handleTimeChange("endTime")}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日付選択</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCalendar(true)}
          >
            <Text style={styles.dateButtonText}>
              {shiftData.dates.length > 0
                ? `${shiftData.dates.length}日選択中`
                : "日付を選択"}
            </Text>
          </TouchableOpacity>
          {shiftData.dates.length > 0 && (
            <View style={styles.selectedDatesContainer}>
              {shiftData.dates.sort().map((date) => (
                <View key={date} style={styles.selectedDateCard}>
                  <Text style={styles.selectedDateText}>
                    {formatDate(date)}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeDateButton}
                    onPress={() => {
                      setShiftData((prev) => ({
                        ...prev,
                        dates: prev.dates.filter((d) => d !== date),
                      }));
                    }}
                  >
                    <Text style={styles.removeDateText}>削除</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>授業時間</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() =>
              setShiftData((prev) => ({ ...prev, hasClass: !prev.hasClass }))
            }
          >
            <Text style={styles.toggleButtonText}>
              {shiftData.hasClass ? "授業あり" : "授業なし"}
            </Text>
          </TouchableOpacity>

          {shiftData.hasClass && (
            <View style={styles.classesContainer}>
              {shiftData.classes.map((classTime, index) => (
                <View key={index} style={styles.classTimeContainer}>
                  <TimeSelect
                    startTime={classTime.startTime}
                    endTime={classTime.endTime}
                    onStartTimeChange={(time: string) =>
                      handleClassTimeChange(index, "startTime", time)
                    }
                    onEndTimeChange={(time: string) =>
                      handleClassTimeChange(index, "endTime", time)
                    }
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeClass(index)}
                  >
                    <AntDesign
                      name="close"
                      size={20}
                      color={colors.text.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addClass}>
                <Text style={styles.addButtonText}>授業を追加</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!shiftData.startTime ||
              !shiftData.endTime ||
              shiftData.dates.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            !shiftData.startTime ||
            !shiftData.endTime ||
            shiftData.dates.length === 0
          }
        >
          <Text style={styles.submitButtonText}>
            {isEditMode ? "更新する" : "登録する"}
          </Text>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>シフトを削除</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={handleDatesConfirm}
        initialDates={shiftData.dates}
      />

      {showSuccess && (
        <Animated.View
          style={[
            styles.successMessage,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.successText}>シフトを追加しました！</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  dateButton: {
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  toggleButton: {
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  classesContainer: {
    gap: 16,
  },
  classTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  submitButton: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.white,
  },
  selectedDatesContainer: {
    marginTop: 12,
    gap: 8,
  },
  selectedDateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  removeDateButton: {
    backgroundColor: colors.error + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeDateText: {
    fontSize: 14,
    color: colors.error,
  },
  successMessage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  successText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
