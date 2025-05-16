import { StyleSheet } from "react-native";
import { colors } from "@/shared/theme/colors";
import { getPlatformShadow } from "@/shared/utils/time";
import { TimeInputSectionStyles } from "./types";

export const styles = StyleSheet.create<TimeInputSectionStyles>({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text.primary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  separator: {
    marginHorizontal: 8,
    color: colors.text.secondary,
  },
  timeButton: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  timeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...getPlatformShadow(4),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerCancelText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  pickerDoneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    height: 216,
  },
});
