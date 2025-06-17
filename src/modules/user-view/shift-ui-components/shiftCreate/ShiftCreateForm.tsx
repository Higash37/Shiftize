import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  useWindowDimensions,
  FlexAlignType,
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
import TimeSelect from "@/modules/user-view/shift-ui-components/TimeSelect";
import CalendarModal from "@/modules/child-components/calendar/calendar-components/calendar-modal/calendarModal/CalendarModal";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import type {
  Shift,
  ShiftStatus,
  ShiftType,
} from "@/common/common-models/ModelIndex";
import { useAuth } from "@/services/auth/useAuth";
import type { ExtendedUser } from "@/modules/child-components/user-management/user-types/components";
import { Header } from "@/common/common-ui/ui-layout";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getUserData, type UserData } from "@/services/firebase/firebase";
import { colors } from "@/common/common-constants/ThemeConstants";
import type { ShiftData, ShiftCreateFormProps } from "./types";
import { shiftCreateFormStyles as styles } from "./styles";

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

  const { width } = useWindowDimensions();
  const isWideScreen = width >= 1024; // PC判定

  const containerStyle = isWideScreen
    ? {
        ...styles.container,
        width: width * 0.8,
        alignSelf: "center" as FlexAlignType,
      } // PC用スタイル
    : styles.container; // その他のデバイス用スタイル

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
    <>
      <View style={{ width: "100%" }}>
        <Header title="シフト作成" />
      </View>
      <ScrollView
        style={containerStyle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {" "}
        {/* スクロールバーを非表示 */}
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
              </View>{" "}
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
                <AntDesign name="plus" size={18} color="white" />
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
                        <AntDesign
                          name="close"
                          size={18}
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
      </ScrollView>
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
    </>
  );
};
