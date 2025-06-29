import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: "100%", // ヘッダーを画面幅いっぱいに
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24, // もともと18、より大きく
    fontWeight: "bold",
    color: colors.text.primary,
  },
  signOutButton: {
    padding: 8,
  },
});
