import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { theme } from "@/common/common-theme/ThemeDefinition";
import { IS_TABLET, IS_SMALL_DEVICE } from "@/common/common-utils/util-style";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

export const shiftListItemStyles = StyleSheet.create({
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: IS_SMALL_DEVICE ? theme.spacing.sm : theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
    marginLeft: "auto", // 追加: 左右中央寄せ
    marginRight: "auto",
  },
  shiftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  shiftInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  dateContainer: {
    width: IS_SMALL_DEVICE ? 60 : 80,
    marginRight: 8,
  },
  dateText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  statusContainer: {
    width: IS_SMALL_DEVICE ? 80 : 90,
    marginRight: 8,
  },
  timeText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.primary,
    flex: 1,
  },
  smallTimeText: {
    fontSize: 12,
  },
  userLabel: {
    color: colors.primary,
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    textAlign: "center",
    width: "100%", // 親のステータスコンテナに合わせて幅一杯に
    overflow: "hidden",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: colors.text.secondary,
  },
  detailsIcon: {
    marginLeft: 4,
  },
  selectedShiftItem: {
    backgroundColor: colors.surface, // 青ではなく通常の白背景に
    // 必要ならborderやshadowも調整
    borderColor: colors.primary, // 選択時は枠だけ青なども可
    borderWidth: 2,
  },
});

export const shiftListViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // ←全面白背景に統一
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    // カレンダー背景枠をなくすため、背景色・border・radius等を削除
    marginTop: 0,
    marginBottom: theme.spacing.sm,
    alignItems: "center",
    width: "100%",
    backgroundColor: undefined, // 追加: 背景色を消す
    borderRadius: undefined, // 追加: 角丸を消す
    borderWidth: undefined, // 追加: 枠線を消す
    borderColor: undefined, // 追加: 枠線色を消す
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  listContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    paddingHorizontal: IS_SMALL_DEVICE ? theme.spacing.md : theme.spacing.lg, // 左右の余白を大きめに統一
    width: "100%",
    // boxSizingは削除（React Native非対応）
  },
  noShiftContainer: {
    padding: theme.spacing.md,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
    alignSelf: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  noShiftText: {
    fontSize: IS_SMALL_DEVICE
      ? theme.typography.fontSize.small
      : theme.typography.fontSize.medium,
    color: colors.text.secondary,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: IS_SMALL_DEVICE ? 48 : 56,
    height: IS_SMALL_DEVICE ? 48 : 56,
    borderRadius: IS_SMALL_DEVICE ? 24 : 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...getPlatformShadow(4),
  },
});
