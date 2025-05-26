export type ShiftHolidaySettings = {
  holidays: string[];
  specialDays: string[];
};

export interface ShiftHolidaySettingsViewProps {
  settings: ShiftHolidaySettings;
  loading: boolean;
  calendarMonth: string;
  selectedDate: string | null;
  showDayModal: boolean;
  setSettings: (settings: ShiftHolidaySettings) => void;
  setCalendarMonth: (month: string) => void;
  setSelectedDate: (date: string | null) => void;
  setShowDayModal: (show: boolean) => void;
  saveSettings: () => void;
}
