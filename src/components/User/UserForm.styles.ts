import { StyleSheet } from "react-native";
import { colors, typography } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  passwordCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  passwordLabel: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  passwordValue: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
  },
  warningText: {
    color: colors.error,
    fontSize: typography.fontSize.small,
    textAlign: "center",
  },
});
