import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { typography } from "../../../../common/common-theme/ThemeTypography";

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
  masterRoleButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary, // 外枠も紫
    borderWidth: 1,
  },
  masterRoleButtonText: {
    color: colors.text.white,
    fontWeight: "700",
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
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#888",
    marginRight: 8,
  },
});
