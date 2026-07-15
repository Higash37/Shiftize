

import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createGanttChartMonthViewStyles } from "../GanttChartMonthView.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { PrintButton } from "../print/PrintButton";
import { ColorToggleButton } from "./ColorToggleButton";
import { ViewToggleButton } from "./ViewToggleButton";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";
import { PeriodSettingModal } from "../modals/PeriodSettingModal";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftSelectionContext } from "./components";
import { DateNavigator } from "@/common/common-ui/ui-navigation/DateNavigator";

interface MonthSelectorBarProps {
  selectedDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onShowYearMonthPicker: () => void;
  onReload: () => void;
  onBatchApprove: () => void;
  onBatchDelete?: () => void;
  isLoading: boolean;
  totalAmount?: number;
  totalHours?: number;
  shifts?: ShiftItem[];
  users?: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>;
  colorMode?: "status" | "user";
  onColorModeToggle?: () => void;
  onPayrollPress?: () => void;
  viewMode?: "gantt" | "calendar";
  onViewModeToggle?: () => void;
  isMobileView?: boolean;
  deviceType?: "desktop" | "tablet" | "mobile";
  useGoogleLayout?: boolean;
  onToggleGoogleLayout?: () => void;
  onOpenHistory?: () => void;
  storeId?: string;
}

export const MonthSelectorBar: React.FC<MonthSelectorBarProps> = (props) => {
  const styles = useThemedStyles(createGanttChartMonthViewStyles);
  const {
    selectedDate,
    onPrevMonth,
    onNextMonth,
    onShowYearMonthPicker,
    onReload,
    onBatchApprove,
    isLoading,
    totalAmount = 0,
    totalHours = 0,
    shifts = [],
    users = [],
    colorMode = "status",
    onColorModeToggle,
    onPayrollPress,
    viewMode = "gantt",
    onViewModeToggle,
    isMobileView = false,
    deviceType = "desktop",
    storeId,
  } = props;

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const { selectedCount } = useContext(ShiftSelectionContext);

  const formattedHours = (() => {
    if (totalHours <= 0) return "0h";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours % 1) * 60);
    return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
  })();

  return (
    <View style={[styles.monthSelector, isMobileView && { paddingHorizontal: 0, justifyContent: "center" }]}>
      {}
      {isMobileView ? null : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0, zIndex: 2 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              minHeight: 36,
            }}
            onPress={onPayrollPress}
            disabled={!onPayrollPress}
          >
            <Text style={{ fontWeight: "bold", color: "#333333", fontSize: 12 }}>
              ¥{totalAmount.toLocaleString()} / {formattedHours}
            </Text>
          </TouchableOpacity>
          {onColorModeToggle && (
            <ColorToggleButton
              colorMode={colorMode}
              onToggle={onColorModeToggle}
            />
          )}
          {onViewModeToggle && (
            <ViewToggleButton
              viewMode={viewMode}
              onToggle={onViewModeToggle}
            />
          )}
          <TouchableOpacity
            style={getButtonStyle("toolbar")}
            onPress={() => setShowPeriodModal(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>期間設定</Text>
          </TouchableOpacity>
        </View>
      )}

      {}
      {deviceType !== "tablet" && (
        isMobileView ? (
          <DateNavigator
            label={`${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            onLabelPress={onShowYearMonthPicker}
          />
        ) : (
          <View style={{
            position: "absolute",
            left: 0,
            right: 0,
            alignItems: "center",
            pointerEvents: "box-none",
            zIndex: 1,
          }}>
            <View style={{ pointerEvents: "auto" }}>
              <DateNavigator
                label={`${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`}
                onPrev={onPrevMonth}
                onNext={onNextMonth}
                onLabelPress={onShowYearMonthPicker}
              />
            </View>
          </View>
        )
      )}

      {}
      {!isMobileView && (
        <View style={[styles.addShiftButtonRow, { zIndex: 2 }]}>
          {Platform.OS === "web" && (
            <PrintButton
              shifts={shifts}
              users={users}
              selectedDate={selectedDate}
            />
          )}
          <TouchableOpacity
            style={getButtonStyle("toolbar")}
            onPress={onBatchApprove}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>
              {selectedCount > 0 ? `一括承認 (${selectedCount})` : "一括承認"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={getButtonStyle("toolbar")} onPress={onReload}>
            <Ionicons name="refresh" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>更新</Text>
          </TouchableOpacity>
          {props.onOpenHistory && (
            <TouchableOpacity
              style={getButtonStyle("toolbar")}
              onPress={props.onOpenHistory}
            >
              <Ionicons name="time-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
              <Text style={getButtonTextStyle("toolbar")}>履歴</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {}
      {storeId && (
        <PeriodSettingModal
          visible={showPeriodModal}
          onClose={() => setShowPeriodModal(false)}
          storeId={storeId}
          users={props.users || []}
          shifts={props.shifts || []}
          onPeriodCreated={(_period) => {

          }}
        />
      )}
    </View>
  );
};
