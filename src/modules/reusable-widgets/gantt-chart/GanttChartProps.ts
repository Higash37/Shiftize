

import { ShiftItem } from "@/common/common-models/ModelIndex";

export interface GanttChartMonthEditProps {
  shifts: ShiftItem[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  classTimes?: { start: string; end: string }[];
}

export interface GanttChartMonthViewProps {
  shifts: ShiftItem[];
  days: string[];
  users: {
    uid: string;
    nickname: string;
    color?: string;
    hourlyWage?: number;
  }[];
  selectedDate: Date;
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: () => void;
  onMonthChange?: (year: number, month: number) => void;
  onTimeChange?: (
    shiftId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  classTimes?: { start: string; end: string }[];
  refreshPage?: () => void;
}
