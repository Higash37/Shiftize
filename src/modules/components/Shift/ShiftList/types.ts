import { ViewStyle, TextStyle } from "react-native";
import { ShiftItem, ShiftStatus } from "../../../types/shift";

export interface ShiftListProps {
  shifts: ShiftItem[];
  onToggleDetails: (shiftId: string) => void;
  showDetails: { [key: string]: boolean };
}

export interface ShiftListStyles {
  container: ViewStyle;
  shiftItem: ViewStyle;
  shiftInfo: ViewStyle;
  dateTime: TextStyle;
  shiftType: TextStyle;
  rightContainer: ViewStyle;
  statusText: TextStyle;
  detailsButton: ViewStyle;
  detailsButtonText: TextStyle;
  detailsContainer: ViewStyle;
  detailSection: ViewStyle;
  detailTitle: TextStyle;
  detailsText: TextStyle;
  changesContainer: ViewStyle;
  changesTitle: TextStyle;
  changesText: TextStyle;
  timelineContainer: ViewStyle;
  timeSlot: ViewStyle;
  classTimeSlot: ViewStyle;
  timeSlotTitle: TextStyle;
}

export type ShiftTypeMap = "user" | "class" | "deleted";
