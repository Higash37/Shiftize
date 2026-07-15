

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  DevSettings,
} from "react-native";
import {
  Shift,
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
  TimeSlot,
  ShiftType,
} from "@/common/common-models/ModelIndex";
import { ServiceProvider } from "@/services/ServiceProvider";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";
import {
  calculateMinutesBetween,
  calculateWage,
  calculateTotalWage,
} from "@/common/common-utils/util-shift/wageCalculator";
import {
  DEFAULT_SHIFT_STATUS_CONFIG,
  ShiftStatusConfig,
} from "@/common/common-models/model-shift/shiftTypes";
import { createGanttChartMonthViewStyles } from "./GanttChartMonthView.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { GanttChartMonthViewProps } from "./GanttChartProps";
import {
  generateTimeOptions,
  groupShiftsByOverlap,
  groupNonOverlappingShifts,
  positionToTime,
  timeToPosition,
} from "./gantt-chart-common/utils";
import { SHIFT_HOURS, BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
  ShiftSelectionProvider,
} from "./gantt-chart-common/components";
import { ShiftModalRenderer, ShiftModalRendererHandle } from "./gantt-chart-common/ShiftModalRenderer";

const PayrollDetailModal = lazy(() =>
  import("./view-modals/PayrollDetailModal").then(module => ({ default: module.PayrollDetailModal }))
);
const BatchConfirmModal = lazy(() => import("./view-modals/BatchConfirmModal"));
const ShiftHistoryModal = lazy(() =>
  import("./view-modals/ShiftHistoryModal").then(module => ({ default: module.ShiftHistoryModal }))
);

import { MonthSelectorBar } from "./gantt-chart-common/MonthSelectorBar";
import { GanttHeader } from "./gantt-chart-common/GanttHeader";
import { GanttChartBody } from "./gantt-chart-common/GanttChartBody";
import { CalendarView } from "./gantt-chart-common/CalendarView";
import { useGanttShiftActions } from "./gantt-chart-common/useGanttShiftActions";
import { MobileVerticalView } from "./gantt-chart-common/MobileVerticalView";
import { GoogleCalendarView } from "./gantt-chart-common/GoogleCalendarView";
import type { ShiftHistoryEntry } from "@/services/shift-history/shiftHistoryLogger";
import { usePendingShiftBadge } from "@/common/common-context/PendingShiftBadgeContext";

const SIMPLIFIED_STATUS_CONFIGS: ShiftStatusConfig[] = [
  { status: "approved", label: "承認済み", color: "#90caf9", canEdit: false, description: "承認されたシフト" },
  { status: "pending", label: "申請中", color: "#FFD700", canEdit: true, description: "新規申請されたシフト" },
  { status: "rejected", label: "却下", color: "#ffcdd2", canEdit: true, description: "却下されたシフト" },
  { status: "deletion_requested", label: "削除申請中", color: "#FF9F0A", canEdit: false, description: "削除申請中のシフト" },
  { status: "deleted", label: "削除済み", color: "#9e9e9e", canEdit: false, description: "削除されたシフト" },
  { status: "completed", label: "完了", color: "#4CAF50", canEdit: false, description: "完了したシフト" },
];

const HOUR_LABELS = Array.from(
  { length: SHIFT_HOURS.END_HOUR_INCLUSIVE - SHIFT_HOURS.START_HOUR_INCLUSIVE + 1 },
  (_, i) => `${SHIFT_HOURS.START_HOUR_INCLUSIVE + i}:00`
);

const HALF_HOUR_LINES = Array.from(
  { length: (SHIFT_HOURS.END_HOUR_INCLUSIVE - SHIFT_HOURS.START_HOUR_INCLUSIVE) * 2 + 1 },
  (_, i) => {
    const hour = SHIFT_HOURS.START_HOUR_INCLUSIVE + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  }
);

const GanttChartMonthViewComponent: React.FC<GanttChartMonthViewProps> = ({
  shifts,
  days,
  users,
  selectedDate,
  onShiftPress,
  onShiftUpdate,
  onMonthChange,
  classTimes = [],
  refreshPage,
}) => {

  const styles = useThemedStyles(createGanttChartMonthViewStyles);

  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    SIMPLIFIED_STATUS_CONFIGS
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  const modalRef = useRef<ShiftModalRendererHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [batchModal, setBatchModal] = useState<{
    visible: boolean;
    type: "approve" | "delete" | null;
  }>({ visible: false, type: null });
  const [colorMode, setColorMode] = useState<"status" | "user">("status");
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [viewMode, setViewMode] = useState<"gantt" | "calendar" | "compact">("gantt");
  const [useGoogleLayout, setUseGoogleLayout] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const { markAsRead } = usePendingShiftBadge();

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const deviceType = useMemo<"desktop" | "tablet" | "mobile">(() => {
    if (windowWidth <= BREAKPOINTS.MOBILE_MAX_WIDTH_INCLUSIVE) return "mobile";
    if (windowWidth < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE) return "tablet";
    return "desktop";
  }, [windowWidth]);

  const shouldUseCompactView = useMemo(() => {
    const isCompactWidth =
      windowWidth < BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE &&
      windowWidth >= BREAKPOINTS.COMPACT_VIEW_MIN_WIDTH_INCLUSIVE;
    return isCompactWidth && viewMode === "gantt";
  }, [windowWidth, viewMode]);
  const { user } = useAuth();
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    users,
    ...(onShiftUpdate && { onShiftUpdate }),

  });

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const scrollBarWidth = 21;
  const dateColumnWidth = 31;
  const infoColumnWidth = Math.max(windowWidth * 0.22, 180);
  const ganttColumnWidth = windowWidth - dateColumnWidth - infoColumnWidth - scrollBarWidth;

  useEffect(() => {

    const unsubscribe = ServiceProvider.settings.onShiftStatusConfigChanged(
      (data) => {
        if (data) {
          const updatedConfigs: ShiftStatusConfig[] =
            DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
              ...config,
              ...data[config.status],
            }));
          setStatusConfigs(updatedConfigs);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusConfig = (status: string): ShiftStatusConfig => {
    const config = statusConfigs.find((config) => config.status === status) || statusConfigs[0];
    return config || {
      status: "pending" as ShiftStatus,
      label: "未定",
      color: "#E5E5E5",
      canEdit: true,
      description: "未定義のステータス"
    };
  };

  const visibleShifts = useMemo(() => {
    return shifts.filter((s) => s.status !== "deleted" && s.status !== "purged");
  }, [shifts]);

  const usersWithRole = useMemo(() => {
    return users.map(user => ({ ...user, role: "staff" as string }));
  }, [users]);

  const rows = useMemo(() => {
    const result: [string, ShiftItem[]][] = days.flatMap((date) => {
      const dayShifts = visibleShifts.filter((s) => s.date === date);
      if (dayShifts.length === 0) return [[date, []]];
      const groups = groupNonOverlappingShifts(dayShifts);

      return groups
        .filter((group) => group.length > 0)
        .map((group) => [date, group] as [string, ShiftItem[]]);
    });
    return result;
  }, [days, visibleShifts]);

  function isClassTime(time: string) {
    return false;
  }

  const cellWidth = ganttColumnWidth / (HOUR_LABELS.length - 1) / 2;

  const handlePrevMonth = useCallback(() => {
    const newDate = subMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  }, [selectedDate, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = addMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  }, [selectedDate, onMonthChange]);

  const handleDateSelect = useCallback((date: Date) => {
    setShowYearMonthPicker(false);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  }, [onMonthChange]);

  const handleBatchDelete = async () => {
    const rejectedShifts = shifts.filter(
      (shift) => shift.status === "rejected"
    );
    rejectedShifts.forEach((shift) => {
      updateShiftStatus(shift.id, "deleted");
    });

  };

  const handleShiftPress = useCallback(
    (shift: ShiftItem) => {
      modalRef.current?.openEdit(shift);

      requestAnimationFrame(() => markAsRead(shift.id));
    },
    [markAsRead]
  );

  const handleHistoryEntryAction = useCallback(
    (entry: ShiftHistoryEntry) => {
      if (!entry) return;

      const existingShift = entry.shiftId
        ? shifts.find((shiftItem) => shiftItem.id === entry.shiftId)
        : undefined;

      if (existingShift) {
        modalRef.current?.openEdit(existingShift);
        setShowHistoryModal(false);
        return;
      }

      const snapshot = entry.nextSnapshot || entry.prevSnapshot;
      if (!snapshot) return;

      modalRef.current?.openAdd({
        date: snapshot.date || entry.date,
        startTime: snapshot.startTime || "09:00",
        endTime: snapshot.endTime || "11:00",
        userId: snapshot.userId || "",
        nickname: snapshot.nickname || "",
        status: (snapshot.status as ShiftStatus) || "pending",
        classes: (snapshot.classes as ClassTimeSlot[] | undefined) || [],
      });
      setShowHistoryModal(false);
    },
    [shifts]
  );

  const handleEmptyCellClick = useCallback(
    (date: string, position: number) => {
      const startTime = positionToTime(position);
      const startHour = Number.parseInt(startTime.split(":")[0] || "0", 10);
      const startMinute = Number.parseInt(startTime.split(":")[1] || "0", 10);
      let endHour = startHour + 1;
      let endMinute = startMinute;
      if (endHour > SHIFT_HOURS.END_HOUR_INCLUSIVE) {
        endHour = SHIFT_HOURS.END_HOUR_INCLUSIVE;
        endMinute = 0;
      }
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      const isMaster = user?.role === "master";
      const defaultUserId = isMaster ? "" : user?.uid || "";
      const defaultNickname = isMaster
        ? ""
        : users.find((u) => u.uid === user?.uid)?.nickname || "";

      modalRef.current?.openAdd({
        date,
        startTime,
        endTime,
        userId: defaultUserId,
        nickname: defaultNickname,
        status: isMaster ? "approved" : "pending",
        classes: [],
        });
    },
    [positionToTime, user, users]
  );

  const handleAddShift = useCallback(() => {
    const isMaster = user?.role === "master";
    const defaultUserId = isMaster ? "" : user?.uid || "";
    const defaultNickname = isMaster
      ? ""
      : users.find((u) => u.uid === user?.uid)?.nickname || "";

    modalRef.current?.openAdd({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "11:00",
      userId: defaultUserId,
      nickname: defaultNickname,
      status: isMaster ? "approved" : "pending",
      classes: [],
    });
  }, [selectedDate, user, users]);

  const handleBodyMonthChange = useCallback((month: { year: number; month: number }) => {
    if (onMonthChange) {
      onMonthChange(month.year, month.month);
    }
  }, [onMonthChange]);

  const handleColorModeToggle = useCallback(() => {
    setColorMode(prev => prev === "status" ? "user" : "status");
  }, []);

  const handlePayrollPress = useCallback(() => {
    setShowPayrollModal(true);
  }, []);

  const handleViewToggle = useCallback(() => {
    setViewMode(prev => prev === "gantt" ? "calendar" : "gantt");
  }, []);

  const userColorsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      if (u.uid && u.color) map[u.uid] = u.color;
    });

    return map;
  }, [users]);

  const userMap = useMemo(() => new Map(users.map(u => [u.uid, u])), [users]);

  const totalWage = useMemo(() => {
    if (!shifts || shifts.length === 0) return { totalAmount: 0, totalHours: 0 };

    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;

    let totalMinutes = 0;
    let totalAmount = 0;

    for (const shift of shifts) {
      if (shift.status !== "approved" && shift.status !== "completed") continue;

      const shiftYear = Number(shift.date.slice(0, 4));
      const shiftMonth = Number(shift.date.slice(5, 7));
      if (shiftYear !== selectedYear || shiftMonth !== selectedMonth) continue;

      const hourlyWage = userMap.get(shift.userId)?.hourlyWage || 1100;
      const { totalMinutes: workMinutes, totalWage: workWage } = calculateTotalWage(
        { startTime: shift.startTime, endTime: shift.endTime, classes: shift.classes || [] },
        hourlyWage
      );
      totalMinutes += workMinutes;
      totalAmount += workWage;
    }

    return { totalHours: totalMinutes / 60, totalAmount: Math.round(totalAmount) };
  }, [shifts, userMap, selectedDate]);

  const handleMobileEmptyCellClick = useCallback((date: string, time: string, userId: string) => {
    const targetUser = users.find(u => u.uid === userId);
    const startTime = time;
    const [hour] = time.split(':').map(Number);
    const endTime = `${(hour ?? 0) + 1}:00`;

    modalRef.current?.openAdd({
      date,
      startTime,
      endTime,
      userId,
      nickname: targetUser?.nickname || "",
      status: user?.role === "master" ? "approved" : "pending",
      classes: [],
    });
  }, [users, user]);

  const handleClassAdd = useCallback((shift: ShiftItem) => {
    modalRef.current?.openEdit(shift);
  }, []);

  return (
    <ShiftSelectionProvider>
    <View style={styles.container}>
      {}
      {deviceType !== "tablet" && (
        <MonthSelectorBar
          selectedDate={selectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onShowYearMonthPicker={() => setShowYearMonthPicker(true)}
          onReload={() => {
            if (typeof window !== "undefined" && window.location) {
              window.location.reload();
            } else if (Platform.OS !== "web") {
              DevSettings.reload();
            }
          }}
          onBatchApprove={() => setBatchModal({ visible: true, type: "approve" })}
          onBatchDelete={() => setBatchModal({ visible: true, type: "delete" })}
          isLoading={isLoading}
          totalAmount={totalWage.totalAmount}
          totalHours={totalWage.totalHours}
          shifts={shifts}
          users={usersWithRole}
          colorMode={colorMode}
          onColorModeToggle={handleColorModeToggle}
          onPayrollPress={handlePayrollPress}
          viewMode={viewMode === "compact" ? "gantt" : viewMode}
          onViewModeToggle={handleViewToggle}
          isMobileView={deviceType !== "desktop"}
          deviceType={deviceType}
          useGoogleLayout={useGoogleLayout}
          onToggleGoogleLayout={() => setUseGoogleLayout(!useGoogleLayout)}
          onOpenHistory={() => setShowHistoryModal(true)}
          storeId={user?.storeId || ""}
        />
      )}
      {}
      {deviceType !== "tablet" && (
        <DatePickerModal
          isVisible={showYearMonthPicker}
          initialDate={selectedDate}
          onClose={() => setShowYearMonthPicker(false)}
          onSelect={handleDateSelect}
        />
      )}
      {}
      {batchModal.visible && (
        <Suspense fallback={null}>
          <BatchConfirmModal
            visible={batchModal.visible}
            type={batchModal.type}
            shifts={shifts}
            isLoading={isLoading}
            styles={styles}
            setBatchModal={setBatchModal}
            setIsLoading={setIsLoading}
            {...(refreshPage && { refreshPage })}
          />
        </Suspense>
      )}
      {}
      {deviceType === "mobile" ? (

        <MobileVerticalView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onClassAdd={handleClassAdd}
          colorMode={colorMode}
          getStatusConfig={getStatusConfig}
          styles={styles}
        />
      ) : deviceType === "tablet" ? (

        <MobileVerticalView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onClassAdd={handleClassAdd}
          colorMode={colorMode}
          getStatusConfig={getStatusConfig}
          styles={styles}
        />
      ) : useGoogleLayout ? (

        <GoogleCalendarView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onAddShift={handleAddShift}
          colorMode={colorMode}
          styles={styles}
        />
      ) : viewMode === "gantt" && shouldUseCompactView ? (

        <MobileVerticalView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onClassAdd={handleClassAdd}
          colorMode={colorMode}
          getStatusConfig={getStatusConfig}
          styles={styles}
        />
      ) : viewMode === "gantt" ? (

        <View style={{ flex: 1 }}>
          <GanttHeader
            hourLabels={HOUR_LABELS}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
          />
          <GanttChartBody
            days={days}
            rows={rows}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
            cellWidth={cellWidth}
            halfHourLines={HALF_HOUR_LINES}
            isClassTime={isClassTime}
            getStatusConfig={getStatusConfig}
            handleShiftPress={handleShiftPress}
            handleEmptyCellClick={handleEmptyCellClick}
            styles={styles}
            userColorsMap={userColorsMap}
            colorMode={colorMode}
            allShifts={shifts}
            selectedDate={selectedDate}
            onDateSelect={(date) => {

            }}
            {...(onMonthChange && { onMonthChange: handleBodyMonthChange })}
            users={usersWithRole}
          />
        </View>
      ) : (

        <CalendarView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && {
            onMonthChange: (month: { year: number; month: number }) =>
              onMonthChange(month.year, month.month)
          })}
          styles={styles}
        />
      )}
      {}
      <ShiftModalRenderer
        ref={modalRef}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        styles={styles}
        saveShift={saveShift}
        deleteShift={deleteShift}
        updateShiftStatus={updateShiftStatus}
        user={user}
        shifts={shifts}
      />
      {}
      {showPayrollModal && (
        <Suspense fallback={null}>
          <PayrollDetailModal
            visible={showPayrollModal}
            onClose={() => setShowPayrollModal(false)}
            shifts={shifts}
            users={users}
            selectedDate={selectedDate}
          />
        </Suspense>
      )}
      {}
      {showHistoryModal && (
        <Suspense fallback={null}>
          <ShiftHistoryModal
            visible={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            storeId={user?.storeId || ""}
            selectedDate={selectedDate}
            onEntryAction={handleHistoryEntryAction}
          />
        </Suspense>
      )}

    </View>
    </ShiftSelectionProvider>
  );
};

export const GanttChartMonthView = React.memo(GanttChartMonthViewComponent);
