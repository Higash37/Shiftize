

import React, { useMemo } from "react";

import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";

import { ServiceProvider } from "@/services/ServiceProvider";

import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";
import { ShiftData } from "@/modules/master-view/ganttView/gantt-modals/ShiftModal";
import { Alert } from "react-native";

import { calculateDurationHours } from "@/common/common-utils/util-shift/wageCalculator";

const INITIAL_DATE = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
const INITIAL_YEAR = INITIAL_DATE.getFullYear();
const INITIAL_MONTH = INITIAL_DATE.getMonth();

export default function GanttEditScreen() {
  const { user } = useAuth();
  const [currentYearMonth, setCurrentYearMonth] = React.useState({
    year: INITIAL_YEAR,
    month: INITIAL_MONTH,
  });

  const {
    shifts,
    changeMonth,
    refetch,
    loading: shiftsLoading,
    error: shiftsError,
  } = useShiftsByMonth(user?.storeId, currentYearMonth.year, currentYearMonth.month);

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useUsers(user?.storeId);

  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    changeMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    await refetch();
  };

  const refreshPage = () => {};

  const handleTimeChange = async (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    try {

      const durationHours = calculateDurationHours(newStartTime, newEndTime);

      await ServiceProvider.shifts.updateShift(shiftId, {
        startTime: newStartTime,
        endTime: newEndTime,
        duration: durationHours,
      });

    } catch (error) {
      Alert.alert("エラー", "シフト時間の変更に失敗しました");
    }
  };

  const handleShiftPress = (shift: ShiftData) => {
    void shift;
  };

  const handleShiftSave = async (data: ShiftData) => {
    try {
      if (data.id) {

        const durationHours = calculateDurationHours(data.startTime, data.endTime);

        await ServiceProvider.shifts.updateShift(data.id, {
          userId: data.userId,
          storeId: user?.storeId || "",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          duration: durationHours,
          status: data.status || "approved",
          classes: data.classes || [],
        });
      } else {

        const targetUser = users.find((u) => u.uid === data.userId);
        const durationHours = calculateDurationHours(data.startTime, data.endTime);

        await ServiceProvider.shifts.addShift({
          userId: data.userId,
          storeId: user?.storeId || "",
          nickname: targetUser?.nickname || "",
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: "user",
          subject: data.subject || "",
          isCompleted: false,
          status: "approved",
          duration: durationHours,
          classes: data.classes || [],
        });
      }
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました");
      throw error;
    }
  };

  const handleShiftDelete = async (shiftId: string) => {
    try {

      await ServiceProvider.shifts.markShiftAsDeleted(shiftId);
    } catch (error) {
      Alert.alert("エラー", "シフトの削除に失敗しました");
      throw error;
    }
  };

  const days = useMemo(() => {
    const { year, month } = currentYearMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
  }, [currentYearMonth]);

  return (
    <GanttEditView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color || '#000000',
      }))}
      days={days}
      loading={shiftsLoading || usersLoading}

      error={
        (shiftsError
          ? typeof shiftsError === "string"
            ? shiftsError
            : shiftsError?.message
          : null) ||
        (usersError
          ? typeof usersError === "string"
            ? usersError
            : usersError?.message
          : null)
      }
      currentYearMonth={currentYearMonth}
      onMonthChange={handleMonthChange}
      onShiftUpdate={handleShiftUpdate}
      onShiftPress={handleShiftPress}
      onShiftSave={handleShiftSave}
      onShiftDelete={handleShiftDelete}
      onTimeChange={handleTimeChange}
      refreshPage={refreshPage}
    />
  );
}
