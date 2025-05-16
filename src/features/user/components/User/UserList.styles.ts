import { StyleSheet } from "react-native";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  list: {
    gap: 12,
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  leftSection: {
    justifyContent: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  middleSection: {
    flex: 1,
    gap: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  userRole: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  passwordContainer: {
    alignItems: "flex-end",
  },
  passwordLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  passwordValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: 24,
    fontSize: typography.fontSize.medium,
  },
});
