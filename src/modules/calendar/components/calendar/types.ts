import { Shift } from "@/common/common-models/ModelIndex";

export interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  dotStyle?: any;
}

export interface ShiftCalendarProps {
  shifts: Shift[];
  selectedDate: string;
  currentMonth: string;
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange?: (month: { dateString: string }) => void;
  markedDates?: Record<string, MarkedDate>;
  onMount?: () => void;
}

export interface DayComponentProps {
  date?: {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
  };
  state?: "disabled" | "today" | "selected";
  marking?: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    dotStyle?: any;
  };
}

export interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
}

export interface ShiftListProps {
  shifts: Shift[];
  selectedDate: string;
}
