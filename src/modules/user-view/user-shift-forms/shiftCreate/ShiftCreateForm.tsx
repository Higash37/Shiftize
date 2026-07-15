
import { MAX_CLASSES_PER_SHIFT_INCLUSIVE } from "@/common/common-constants/BoundaryConstants";
import React, { useState, useEffect } from "react";
import {
  View,
  Animated,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { useAuth } from "@/services/auth/useAuth";
import { Header, Footer } from "@/common/common-ui/ui-layout";
import type { ShiftData, ShiftCreateFormProps } from "./types";
import { shiftCreateFormStyles as styles } from "./styles";
import ShiftCreateFormContent from "./ShiftCreateFormContent";
import type { Shift, ClassTimeSlot } from "@/common/common-models/ModelIndex";
import { calculateDurationHours, timeStringToMinutes } from "@/common/common-utils/util-shift/wageCalculator";
import type { FlexAlignType } from "react-native";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";

export const ShiftCreateForm: React.FC<ShiftCreateFormProps> = ({
  initialMode,
  initialShiftId,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialClasses,
}) => {
  const router = useRouter();
  const { createShift } = useShift();

  const isEditMode = initialMode === "edit";
  const { user } = useAuth();

  const [existingShift, setExistingShift] = useState<Shift | null>(null);

  const [shiftData, setShiftData] = useState<ShiftData>({
    startTime: initialStartTime || "",
    endTime: initialEndTime || "",
    dates: initialDate ? [initialDate] : [],
    hasClass: initialClasses ? JSON.parse(initialClasses).length > 0 : false,
    classes: initialClasses ? JSON.parse(initialClasses) : [],
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSuccess, setShowSuccess] = useState(false);

  const fadeAnim = new Animated.Value(0);

  const [errorMessage, setErrorMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStartTime, setSelectedStartTime] = useState(
    initialStartTime || ""
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedEndTime, setSelectedEndTime] = useState(initialEndTime || "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedClasses, setSelectedClasses] = useState<ClassTimeSlot[]>(() => {
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
  const isWideScreen = width >= 1024;

  const containerStyle = isWideScreen
    ? {
        ...styles.container,
        width: width * 0.6,
        alignSelf: "center" as FlexAlignType,
      }
    : styles.container;

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!user || !isEditMode || !initialShiftId) return;

    ServiceProvider.shifts
      .getShift(initialShiftId)
      .then((shiftData) => {
        if (shiftData) setExistingShift(shiftData);
      })
      .catch(() => {

      });
  }, [user, isEditMode, initialShiftId]);

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
        endTime: updatedClasses[index]?.endTime || "",
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
        startTime: updatedClasses[index]?.startTime || "",
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
    setSelectedDate(dates[0] ?? "");
    setShowCalendar(false);
  };

  const addClass = () => {
    if (shiftData.classes.length > MAX_CLASSES_PER_SHIFT_INCLUSIVE) {
      setErrorMessage("13:00~17:00のようにまとめてください");
      return;
    }

    const defaultStartTime = "14:00";
    const defaultEndTime = "15:00";
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

    if (timeStringToMinutes(shiftData.startTime) >= timeStringToMinutes(shiftData.endTime)) {
      setErrorMessage("終了時間は開始時間より後である必要があります");
      return false;
    }

    const shiftStartMin = timeStringToMinutes(shiftData.startTime);
    const shiftEndMin = timeStringToMinutes(shiftData.endTime);

    for (let i = 0; i < shiftData.classes.length; i++) {
      const classItem = shiftData.classes[i];
      if (!classItem) continue;
      const classStartMin = timeStringToMinutes(classItem.startTime ?? "00:00");
      const classEndMin = timeStringToMinutes(classItem.endTime ?? "00:00");

      if (classStartMin >= classEndMin) {
        setErrorMessage(
          `途中時間${i + 1}の終了時間は開始時間より後である必要があります`
        );
        return false;
      }

      if (classStartMin < shiftStartMin || classEndMin > shiftEndMin) {
        setErrorMessage(`途中時間${i + 1}の時間はシフト時間内である必要があります`);
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  const handleCreateOrUpdateShift = async () => {
    if (!validateShift() || !user) return;

    setIsLoading(true);

    try {
      for (const date of shiftData.dates) {
        const durationHours = calculateDurationHours(shiftData.startTime, shiftData.endTime);

        const shiftObject = {
          userId: user.uid,
          storeId: (isEditMode && existingShift?.storeId) || user.storeId || "",
          nickname: user.nickname || "Unknown",
          date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          type: "user" as const,
          subject: "",
          isCompleted: false,
          status: isEditMode
            ? existingShift?.status || "pending"
            : ("pending" as const),
          duration: durationHours,
          classes: shiftData.classes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (isEditMode && initialShiftId) {
          await ServiceProvider.shifts.updateShift(initialShiftId, {
            ...shiftObject,
            updatedAt: new Date(),
          } as any);
        } else {
          await createShift(shiftObject);
        }
      }

      router.push("/(main)/user/shifts");
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("シフトの保存中にエラーが発生しました");
    }
  };

  const handleDeleteShift = async () => {
    if (!isEditMode || !initialShiftId) return;

    try {
      setIsDeleting(true);

      const existingShiftData = await ServiceProvider.shifts.getShift(initialShiftId);
      if (existingShiftData) {
        if (existingShiftData.status === "pending") {

          await ServiceProvider.shifts.updateShift(initialShiftId, {
            status: "deleted",
            updatedAt: new Date(),
          } as any);
        } else {

          await ServiceProvider.shifts.updateShift(initialShiftId, {
            status: "deletion_requested",
            updatedAt: new Date(),
          } as any);
        }
      }

      setIsDeleting(false);
      router.push("/(main)/user/shifts");
    } catch (error) {
      const errorMessage = (error as Error).message;
      setIsDeleting(false);
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
        <View style={styles.loadingContainer} />
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
        isLoading={isLoading}
        isDeleting={isDeleting}
      />
    </>
  );
};
