import React from "react";
import { useShifts } from "@/common/common-utils/util-shift/useShiftQueries";
import { useUsers } from "@/modules/child-components/user-management/user-hooks/useUserList";
import { GanttEditView } from "@/modules/master-view/ganttEdit/GanttEditView";

export default function GanttEditScreen() {
  const {
    shifts,
    fetchShiftsByMonth,
    loading: shiftsLoading,
    error: shiftsError,
  } = useShifts();
  const { users, loading: usersLoading, error: usersError } = useUsers();

  const [currentYearMonth, setCurrentYearMonth] = React.useState(() => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1);
    return { year: nextMonth.getFullYear(), month: nextMonth.getMonth() };
  });

  const handleMonthChange = async (year: number, month: number) => {
    setCurrentYearMonth({ year, month });
    await fetchShiftsByMonth(year, month);
  };

  const handleShiftUpdate = async () => {
    await fetchShiftsByMonth(currentYearMonth.year, currentYearMonth.month);
  };

  const handleShiftPress = (shift: any) => {
    console.log("Shift pressed:", shift);
  };

  const generateDaysForMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toISOString().split("T")[0];
    });
  };

  const days = generateDaysForMonth(
    currentYearMonth.year,
    currentYearMonth.month
  );

  return (
    <GanttEditView
      shifts={shifts}
      users={users.map((user) => ({
        uid: user.uid,
        nickname: user.nickname,
        color: user.color,
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
    />
  );
}
