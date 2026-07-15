

import { ViewStyle } from "react-native";
import { Shift, ShiftItem } from "@/common/common-models/ModelIndex";

export interface ShiftCalendarProps {
  shifts: Shift[] | ShiftItem[];
  selectedDate: string;
  currentMonth: string;
  currentUserStoreId?: string;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
  markedDates?: Record<string, any>;
  onMount?: () => void;
  hideMonthNav?: boolean;
  responsiveSize?: {
    calendar?: ViewStyle;
    container?: ViewStyle;
    header?: any;
    day?: any;
    scale?: number;
  };
}

export interface CalendarHeaderInfo {
  month: number;
  year: number;
  timestamp: number;
  dateString: string;
  monthName: string;
}

export interface ShiftCalendarStyles {
  container: ViewStyle;
  containerFullWidth: ViewStyle;
  calendar: ViewStyle;
  calendarShadow: ViewStyle;
}
