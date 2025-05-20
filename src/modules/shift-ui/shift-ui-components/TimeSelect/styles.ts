import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { TimeSelectStyles } from "./types";
import {
  shiftUIConstants,
  shiftUIStyles,
} from "../../shift-ui-utils/ui-constants";

export const styles = StyleSheet.create<TimeSelectStyles>({
  ...shiftUIStyles,
  container: {
    ...shiftUIStyles.container,
    marginBottom: shiftUIConstants.spacing.md,
  },
  timeContainer: {
    flexDirection: "row",
    gap: shiftUIConstants.spacing.md,
  },
  timeSelect: {
    flex: 1,
  },
  label: {
    ...shiftUIStyles.label,
  },
  button: {
    ...shiftUIStyles.input,
  },
  buttonText: {
    fontSize: shiftUIConstants.fontSize.lg,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
  },
  optionsContainer: {
    maxHeight: 300,
  },
  scrollContainer: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.text.white,
  },
});
