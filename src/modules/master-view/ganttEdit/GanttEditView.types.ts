import { ShiftItem } from "@/common/common-models/ModelIndex";

export interface GanttEditViewProps {
  shifts: ShiftItem[];
  users: Array<{ uid: string; nickname: string; color?: string }>;
  days: string[];
  loading: boolean;
  error: string | null;
  currentYearMonth: { year: number; month: number };
  onMonthChange: (year: number, month: number) => void;
  onShiftUpdate: () => void;
  onShiftPress: (shift: ShiftItem) => void;
}
