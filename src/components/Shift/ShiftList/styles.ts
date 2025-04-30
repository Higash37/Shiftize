import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { ShiftListStyles } from "./types";

export const styles = StyleSheet.create<ShiftListStyles>({
  container: {
    padding: 16,
  },
  shiftItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  shiftType: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  detailSection: {
    gap: 4,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  detailsText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  changesContainer: {
    marginTop: 8,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  changesText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  timelineContainer: {
    gap: 8,
  },
  timeSlot: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
  },
  classTimeSlot: {
    backgroundColor: `${colors.primary}10`,
  },
  timeSlotTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.secondary,
    marginBottom: 2,
  },
});

// シフトステータスに応じた色を取得する関数
export const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return colors.shift.draft;
    case "pending":
      return colors.shift.pending;
    case "approved":
      return colors.shift.approved;
    case "completed":
      return colors.shift.completed;
    case "deleted":
      return colors.shift.deleted;
    default:
      return colors.shift.draft;
  }
};
