import { ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

// --- Edit 用 ---
export interface GanttChartMonthEditProps {
  shifts: ShiftItem[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  classTimes?: { start: string; end: string }[];
}

// --- View 用 ---
export interface GanttChartMonthViewProps {
  shifts: ShiftItem[];
  days: string[];
  users: string[];
  onShiftPress?: (shift: ShiftItem) => void;
  onShiftUpdate?: (shift: ShiftItem) => void;
  onMonthChange?: (year: number, month: number) => void;
  classTimes?: { start: string; end: string }[];
}
