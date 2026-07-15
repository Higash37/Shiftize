

import React, { useState, useMemo } from "react";
import { View, Modal, StyleSheet, useWindowDimensions } from "react-native";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { createHomeViewStyles } from "../home-styles/home-view-styles";
import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import { HomeGanttWideScreen } from "./HomeGanttWideScreen";
import { HomeGanttMobileScreen } from "./HomeGanttMobileScreen";
import { HomeGanttTabletScreen } from "./HomeGanttTabletScreen";
import { UserDayGanttModal } from "../home-components/home-gantt/UserDayGanttModal";
import { useHomeGanttState } from "../home-components/home-hooks/useHomeGanttState";
import { DateNavBar } from "../home-components/home-nav/DateNavBar";
import ChangePassword from "@/modules/reusable-widgets/user-management/user-props/ChangePassword";
import { NextShiftWidget } from "../home-components/home-widgets/NextShiftWidget";
import { TodayStaffWidget } from "../home-components/home-widgets/TodayStaffWidget";
import { NextShiftDetailModal } from "../home-components/home-widgets/NextShiftDetailModal";
import { useAuth } from "@/services/auth/useAuth";

export default function HomeCommonScreen() {
  const styles = useThemedStyles(createHomeViewStyles);
  const gantt = useHomeGanttState();
  const { user } = useAuth();
  const { height } = useWindowDimensions();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNextShiftModal, setShowNextShiftModal] = useState(false);
  const [showShiftListModal, setShowShiftListModal] = useState(false);

  const openDatePicker = () => gantt.setShowDatePicker(true);
  const handlePrevDay = () =>
    gantt.setSelectedDate((d: Date) => {
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 1);
      return prev;
    });
  const handleNextDay = () =>
    gantt.setSelectedDate((d: Date) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return next;
    });

  const approvedAndCompletedSchedule = gantt.scheduleForSelectedDate.filter(
    (shift) => shift.status === "approved" || shift.status === "completed"
  );

  const nextShift = useMemo(() => {
    if (!user?.uid) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userFutureShifts = gantt.shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);
        return (
          shift.userId === user.uid &&
          (shift.status === "approved" || shift.status === "pending") &&
          shiftDate >= today
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return userFutureShifts[0] || null;
  }, [gantt.shifts, user?.uid]);

  const userFutureShifts = useMemo(() => {
    if (!user?.uid) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return gantt.shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);
        return (
          shift.userId === user.uid &&
          (shift.status === "approved" || shift.status === "pending") &&
          shiftDate >= today
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  }, [gantt.shifts, user?.uid]);

  const calendarMaxHeight = useMemo(() => {
    const navBarHeight = 50;
    const footerHeight = 80;
    const availableHeight = height - navBarHeight - footerHeight;
    return availableHeight * 0.6;
  }, [height]);

  const renderGanttScreen = useMemo(() => {
    if (gantt.isWide) {
      return (
        <HomeGanttWideScreen
          namesFirst={[]}
          namesSecond={[]}
          timesFirst={[]}
          timesSecond={[]}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={false}
          onCellPress={gantt.setModalUser}
          selectedDate={gantt.selectedDate}
          onDateSelect={gantt.setSelectedDate}
          allTimes={gantt.allTimes}
          shifts={gantt.shifts}
          shiftsForDate={gantt.shiftsForDate}
          currentYearMonth={gantt.currentYearMonth}
          currentUserStoreId={gantt.currentUserStoreId}
        />
      );
    }

    if (gantt.isTablet) {
      return (
        <HomeGanttTabletScreen
          namesFirst={[]}
          namesSecond={[]}
          timesFirst={gantt.allTimes.slice(
            0,
            Math.ceil(gantt.allTimes.length / 2)
          )}
          timesSecond={gantt.allTimes.slice(
            Math.ceil(gantt.allTimes.length / 2) - 1
          )}
          sampleSchedule={approvedAndCompletedSchedule}
          CELL_WIDTH={gantt.CELL_WIDTH}
          showFirst={false}
          onCellPress={gantt.setModalUser}
          selectedDate={gantt.selectedDate}
          onDateSelect={gantt.setSelectedDate}
          allTimes={gantt.allTimes}
          shifts={gantt.shifts}
          shiftsForDate={gantt.shiftsForDate}
          currentYearMonth={gantt.currentYearMonth}
          currentUserStoreId={gantt.currentUserStoreId}
        />
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {}
        <View style={{ flex: 6 }}>
          <HomeGanttMobileScreen
            namesFirst={[]}
            namesSecond={[]}
            timesFirst={gantt.allTimes.slice(
              0,
              Math.ceil(gantt.allTimes.length / 2)
            )}
            timesSecond={gantt.allTimes.slice(
              Math.ceil(gantt.allTimes.length / 2) - 1
            )}
            sampleSchedule={approvedAndCompletedSchedule}
            CELL_WIDTH={gantt.CELL_WIDTH}
            showFirst={false}
            onCellPress={gantt.setModalUser}
            selectedDate={gantt.selectedDate}
            onDateSelect={gantt.setSelectedDate}
            shiftsForDate={gantt.shiftsForDate}
            maxHeight={calendarMaxHeight}
            showShiftListModal={showShiftListModal}
            onToggleShiftListModal={setShowShiftListModal}
          />
        </View>

        {}
        <View style={{ flex: 4 }}>
          <View style={widgetStyles.widgetContainer}>
            <NextShiftWidget
              nextShift={nextShift}
              onPress={() => setShowNextShiftModal(true)}
            />
            <TodayStaffWidget
              todayShifts={gantt.shiftsForDate}
              onPress={() => setShowShiftListModal(true)}
            />
          </View>
        </View>
      </View>
    );
  }, [
    gantt.isWide,
    gantt.isTablet,
    gantt.allTimes,
    gantt.CELL_WIDTH,
    gantt.setModalUser,
    gantt.selectedDate,
    gantt.setSelectedDate,
    gantt.shifts,
    gantt.shiftsForDate,
    gantt.currentYearMonth,
    gantt.currentUserStoreId,
    approvedAndCompletedSchedule,
    calendarMaxHeight,
    showShiftListModal,
    setShowShiftListModal,
    nextShift,
  ]);

  return (
    <View style={[styles.container, { flex: 1 }]}>
      {}
      {!gantt.isWide && (
        <DateNavBar
          isMobile={!gantt.isWide}
          showFirst={false}
          onToggleHalf={() => {}}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          dateLabel={format(gantt.selectedDate, "yyyy年M月d日(E)", { locale: ja })}
          onOpenDatePicker={openDatePicker}
          onPressSettings={() => setShowPasswordModal(true)}
        />
      )}

      <DatePickerModal
        isVisible={gantt.showDatePicker}
        initialDate={gantt.selectedDate}
        onClose={() => gantt.setShowDatePicker(false)}
        onSelect={(date) => {
          gantt.setSelectedDate(date);
          gantt.setShowDatePicker(false);
        }}
      />

      {}
      {renderGanttScreen}

      {}
      <UserDayGanttModal
        visible={!!gantt.modalUser}
        onClose={() => gantt.setModalUser(null)}
        userName={gantt.modalUser || ""}
        sampleSchedule={gantt.scheduleForSelectedDate}
      />

      {}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <ChangePassword onComplete={() => setShowPasswordModal(false)} />
      </Modal>

      {}
      <NextShiftDetailModal
        visible={showNextShiftModal}
        onClose={() => setShowNextShiftModal(false)}
        shifts={userFutureShifts}
      />
    </View>
  );
}

const widgetStyles = StyleSheet.create({
  widgetContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 12,
  },
});
