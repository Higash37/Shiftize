import React, { useState, useEffect } from "react";
import {
  View,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { useAuth } from "@/services/auth/useAuth";
import { Header, Footer } from "@/common/common-ui/ui-layout";
import { colors } from "@/common/common-constants/ThemeConstants";
import { designSystem } from "@/common/common-constants/DesignSystem";
import type { ShiftData, ShiftCreateFormProps } from "./types";
import { shiftCreateFormStyles as styles } from "./styles";
import ShiftCreateFormContent from "./ShiftCreateFormContent";
import type { UserData } from "@/services/firebase/firebase";
import type { Shift } from "@/common/common-models/ModelIndex";
import type { FlexAlignType } from "react-native";
import ChangePassword from "@/modules/child-components/user-management/user-props/ChangePassword";

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

  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const handleDateSelect = (dates: string[]) => {
    setShiftData((prev) => ({
      ...prev,
      dates,
    }));
    setSelectedDate(dates[0]); // 最初の日付を選択状態に設定
    setShowCalendar(false);
  };

  const MAX_CLASSES = 7;

  const addClass = () => {
    if (shiftData.classes.length >= MAX_CLASSES) {
      setErrorMessage("13:00~17:00のようにまとめてください");
      return;
    }
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

      for (const date of shiftData.dates) {
        // 時間の差を計算（duration）
        const startTimeDate = new Date(`2000-01-01T${shiftData.startTime}`);
        const endTimeDate = new Date(`2000-01-01T${shiftData.endTime}`);
        const durationMs = endTimeDate.getTime() - startTimeDate.getTime();
        const durationHours =
          Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // 小数点第1位まで

        const shiftObject = {
          userId: user.uid,
          storeId: user.storeId || "", // userオブジェクトからstoreIdを取得
          nickname: user.nickname || "Unknown",
          date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          type: "user" as const,
          subject: "", // 授業科目（初期値は空文字）
          isCompleted: false,
          status: isEditMode
            ? existingShift?.status || "pending"
            : ("pending" as const),
          duration: durationHours, // number型として時間数を設定
          classes: shiftData.classes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (isEditMode && initialShiftId) {
          // 編集モードの場合は直接Firestoreを更新（useShiftのeditShiftは別のロジックのため）
          const shiftRef = doc(db, "shifts", initialShiftId);
          await updateDoc(shiftRef, {
            ...shiftObject,
            updatedAt: serverTimestamp(),
          });
        } else {
          // 新規作成の場合はuseShiftのcreateShiftメソッドを使用
          await createShift(shiftObject);
        }
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
      }, 10);
    } catch (error) {
      console.error("Error creating/updating shift:", error);
      setIsLoading(false);
      setErrorMessage("シフトの保存中にエラーが発生しました");
    }
  };

  const handleDeleteShift = async () => {
    if (!isEditMode || !initialShiftId) return;

    try {
      setIsLoading(true);

      const shiftDoc = await getDoc(doc(db, "shifts", initialShiftId));
      if (shiftDoc.exists()) {
        const shiftData = shiftDoc.data();

        if (shiftData.status === "pending") {
          // 承認待ちの場合は即時削除
          await updateDoc(doc(db, "shifts", initialShiftId), {
            status: "deleted",
            updatedAt: serverTimestamp(),
          });
        } else {
          // それ以外は削除申請
          await updateDoc(doc(db, "shifts", initialShiftId), {
            status: "deletion_requested",
            updatedAt: serverTimestamp(),
          });
        }

        // Firestoreの更新結果を確認
        const updatedShiftDoc = await getDoc(doc(db, "shifts", initialShiftId));
        if (updatedShiftDoc.exists()) {
        } else {
          console.error("Shift document not found after update.");
        }
      } else {
        console.error("Shift document not found.");
      }

      setIsLoading(false);
      router.back();
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Error deleting shift:", error);
      setIsLoading(false);
      setErrorMessage("シフトの削除中にエラーが発生しました: " + errorMessage);
    }
  };
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title={isEditMode ? "シフト編集" : "シフト作成"}
          showBackButton
          onBack={() => router.back()}
          onPressSettings={() => setShowPasswordModal(true)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <ChangePassword onComplete={() => setShowPasswordModal(false)} />
          <Footer />
        </Modal>
      </View>
    );
  }

  return (
    <>
      <View style={{ width: "100%" }}>
        <Header
          title="シフト作成"
          onPressSettings={() => setShowPasswordModal(true)}
        />
      </View>
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
        <Footer />
      </Modal>
      <ShiftCreateFormContent
        containerStyle={containerStyle}
        selectedDate={selectedDate}
        setShowCalendar={setShowCalendar}
        handleDateSelect={handleDateSelect}
        shiftData={shiftData}
        handleTimeChange={handleTimeChange}
        addClass={addClass}
        removeClass={removeClass}
        errorMessage={errorMessage}
        handleCreateOrUpdateShift={handleCreateOrUpdateShift}
        handleDeleteShift={handleDeleteShift}
        isEditMode={isEditMode}
        showCalendar={showCalendar}
        showSuccess={showSuccess}
        fadeAnim={fadeAnim}
      />
    </>
  );
};
