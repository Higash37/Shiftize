import { StyleSheet, Platform } from "react-native";
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
    margin: 0, // PWA対応: 余白をリセット
    borderRadius: 0, // PWA対応: 角丸をリセット
    borderTopLeftRadius: 0, // PWA対応: 個別指定
    borderTopRightRadius: 0, // PWA対応: 個別指定
    borderBottomLeftRadius: 0, // PWA対応: 個別指定
    borderBottomRightRadius: 0, // PWA対応: 個別指定
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
