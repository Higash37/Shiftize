import { ViewStyle, TextStyle } from "react-native";
import { Shift } from "@/features/shift/types/shift";

export interface ShiftDetailsProps {
  shift: Shift;
  maxHeight?: number;
  isOpen: boolean;
}

export interface ShiftDetailsStyles {
  container: ViewStyle;
  header: ViewStyle;
  nickname: TextStyle;
  date: TextStyle;
  timeSlots: ViewStyle;
  timeSlot: ViewStyle;
  classTimeSlot: ViewStyle;
  timeSlotLabel: TextStyle;
  classLabel: TextStyle;
  timeText: TextStyle;
  classTime: TextStyle;
}
