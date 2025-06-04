import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { ShiftCalendar } from "@/modules/child-components/calendar/calendar-components/calendar-main/ShiftCalendar";
import { colors } from "@/common/common-theme/ThemeColors";
import { useShift } from "@/common/common-utils/util-shift/useShiftActions";
import { useAuth } from "@/services/auth/useAuth";
import { format } from "date-fns";
import { ShiftListItem } from "./ShiftListItem";
import { ShiftDetailsView } from "../shiftDetail/ShiftDetailsView";
import { splitShiftIntoTimeSlots } from "../../shift-ui-utils/shift-time.utils";
import { shiftListViewStyles as styles, modalStyles } from "./styles";
import { ViewStyle } from "react-native";
import { useMonthlyShifts } from "./ShiftListLogic";
import { Shift } from "./types";
import { ShiftModal } from "./ShiftModal";
import { useShiftHandlers } from "./ShiftListHandlers";

export const UserShiftList = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { shifts, loading: shiftsLoading, fetchShifts } = useShift();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });
  const [displayMonth, setDisplayMonth] = useState<string | null>(null);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [isCalendarMounted, setIsCalendarMounted] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalShift, setModalShift] = useState<any>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [taskCounts, setTaskCounts] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const shiftRefs = useRef<{ [key: string]: any }>({}).current;

  // 画面がフォーカスされた時にデータを更新
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchShifts();
    });

    return unsubscribe;
  }, [navigation, fetchShifts]);

  // 初回マウント時にデータを取得
  useEffect(() => {
    fetchShifts();
  }, []);

  // カレンダーがマウントされた時に現在の月を設定
  const handleCalendarMount = () => {
    setIsCalendarMounted(true);
    setDisplayMonth(currentMonth);
  };

  const handleMonthChange = (month: { dateString: string }) => {
    setCurrentMonth(month.dateString);
    setDisplayMonth(month.dateString);
    setSelectedDate("");
    setSelectedShiftId(null);
  };

  // 月ごとにシフトをグループ化
  const monthlyShifts = useMonthlyShifts(
    shifts,
    displayMonth || "",
    user || { uid: "" }
  );

  if (shiftsLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }
  // `handleShiftEdit` をコンポーネントの先頭に移動
  const handleShiftEdit = (shift: any) => {
    router.push({
      pathname: "/(main)/user/shifts/create",
      params: {
        mode: "edit",
        shiftId: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        classes: JSON.stringify(shift.classes || []),
      },
    });
  };

  const { handleDayPress, handleShiftPress } = useShiftHandlers(
    monthlyShifts,
    shiftRefs,
    scrollViewRef,
    setSelectedDate,
    setModalShift,
    setModalVisible,
    handleShiftEdit
  );

  const handleReportShift = () => {
    if (modalShift) {
      setModalVisible(false);
      setReportModalVisible(true);
      setTaskCounts({
        タスク1: 0,
        タスク2: 0,
        タスク3: 0,
        その他: 0,
      });
    }
  };

  const handleEditShift = () => {
    if (modalShift) {
      handleShiftEdit(modalShift);
    }
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.calendarContainer}>
          <ShiftCalendar
            shifts={monthlyShifts}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(main)/user/shifts/create")}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
        <ShiftModal
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          modalShift={modalShift}
          handleReportShift={handleReportShift}
          handleEditShift={handleEditShift}
          reportModalVisible={reportModalVisible}
          setReportModalVisible={setReportModalVisible}
          taskCounts={taskCounts}
          setTaskCounts={setTaskCounts}
          comments={comments}
          setComments={setComments}
        />
      </View>
    </>
  );
};
