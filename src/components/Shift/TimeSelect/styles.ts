import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";
import { TimeSelectStyles } from "./types";

export const styles = StyleSheet.create<TimeSelectStyles>({
  container: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 16,
  },
  timeSelect: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  button: {
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
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
