export type ShiftRuleSettings = {
  maxWorkHours: number;
  minBreakMinutes: number;
  maxConsecutiveDays: number;
};

export interface ShiftRuleSettingsViewProps {
  settings: ShiftRuleSettings;
  loading: boolean;
  onChange: (settings: ShiftRuleSettings) => void;
  onSave: () => void;
  picker: null | "maxWorkHours" | "minBreakMinutes" | "maxConsecutiveDays";
  setPicker: (
    picker: null | "maxWorkHours" | "minBreakMinutes" | "maxConsecutiveDays"
  ) => void;
}
