

import { ViewStyle, TextStyle } from "react-native";

export interface DatePickerModalProps {
  isVisible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

export interface YearPickerProps {
  tempDate: Date;
  onYearSelect: (year: number) => void;
  onCancel: () => void;
}

export interface MonthPickerProps {
  tempDate: Date;
  onMonthSelect: (month: number) => void;
  onBack: () => void;
}

export interface DatePickerModalStyles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  pickerContainer: ViewStyle;
  pickerItem: ViewStyle;
  selectedItem: ViewStyle;
  pickerText: TextStyle;
  selectedText: TextStyle;
  monthGrid: ViewStyle;
  monthItem: ViewStyle;
  monthItemText: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  modalButtonText: TextStyle;
}
