import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { theme } from "@/common/common-theme/ThemeDefinition";
import { IS_TABLET, IS_SMALL_DEVICE } from "@/common/common-utils/util-style";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const shiftListItemStyles = StyleSheet.create({
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: IS_SMALL_DEVICE ? 4 : 6, // パディングをさらに縮小
    borderWidth: 1,
    borderColor: colors.status.approved, // ステータスに応じた色を適用
    backgroundColor: colors.surface,
    borderRadius: IS_SMALL_DEVICE
      ? theme.borderRadius.sm
      : theme.borderRadius.md, // 角丸を調整
    marginBottom: 3, // マージンをさらに縮小
    width: "100%", // 親コンテナの幅いっぱいに広げる
    marginLeft: 0, // 左右マージン削除
    marginRight: 0,
    ...getPlatformShadow(1), // 薄いシャドウを追加
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
    width: IS_SMALL_DEVICE ? 55 : 70, // 幅をさらに縮小
    marginRight: 3, // マージンをさらに縮小
  },
  dateText: {
    fontSize: IS_SMALL_DEVICE ? 15 : 17, // フォントサイズを大きく
    fontWeight: "bold",
    color: colors.text.primary,
  },
  statusContainer: {
    width: IS_SMALL_DEVICE ? 70 : 80, // 幅をさらに縮小
    marginRight: 3, // マージンをさらに縮小
  },
  timeText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16, // 時間表示を大きく
    fontWeight: "500", // フォントを少し太く
    color: colors.text.primary,
    flex: 1,
  },
  smallTimeText: {
    fontSize: 12,
  },
  userLabel: {
    color: colors.primary,
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 4, // パディングを縮小
    paddingVertical: 2, // パディングを縮小
    borderRadius: 4,
    fontSize: IS_SMALL_DEVICE ? 12 : 14, // フォントサイズを少し小さく
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
    overflow: "hidden",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2, // ギャップを縮小
    paddingVertical: 2, // パディングを縮小
    paddingHorizontal: 4, // パディングを縮小
  },
  detailsText: {
    fontSize: IS_SMALL_DEVICE ? 11 : 13, // フォントサイズを縮小
    color: colors.text.secondary,
  },
  detailsIcon: {
    marginLeft: 2, // マージンを縮小
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
    backgroundColor: "#fff",
    flexDirection: IS_TABLET ? "row" : "column", // タブレット以上で2カラム
    alignItems: IS_TABLET ? "flex-start" : "stretch",
    justifyContent: "flex-start",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    flex: IS_TABLET ? 1 : undefined,
    minWidth: IS_TABLET ? 340 : undefined,
    maxWidth: IS_TABLET ? 480 : undefined, // カレンダーの最大幅を設定
    width: IS_TABLET ? undefined : "96%", // 小さい画面では96%に合わせる
    marginBottom: 4, // マージンを最小化
    alignItems: "center",
    alignSelf: "center", // 中央揃え
    padding: 0,
    margin: 0,
  },
  listContainer: {
    flex: IS_TABLET ? 1 : undefined,
    width: "96%", // カレンダーと同じ幅に固定
    minWidth: IS_TABLET ? 320 : undefined,
    maxWidth: 480, // カレンダーと同じ最大幅に設定
    paddingHorizontal: 0,
    paddingLeft: 0,
    marginLeft: 0,
    marginRight: 0,
    alignSelf: "center", // 中央揃え
  },
  listContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    paddingHorizontal: 0, // 水平パディングを削除して幅を合わせる
    paddingBottom: 80, // 下部に余白を追加して、ボタンに隠れないようにする
    width: "100%", // 親コンテナの幅いっぱいに広げる
    borderRadius: 16, // カレンダーと同じ角丸
  },
  noShiftContainer: {
    padding: theme.spacing.sm,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    alignSelf: "center",
    marginLeft: 0,
    marginRight: 0,
    borderWidth: 1,
    borderColor: colors.border,
    ...getPlatformShadow(1), // カレンダーと同様の見た目に
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
export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center", // 型エラー解消のため修正
  },
  modalContent: {
    width: IS_TABLET || SCREEN_WIDTH > 1024 ? "40%" : "80%", // PCでは40%、モバイルでは80%
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700", // 修正
    marginBottom: 16,
    color: colors.primary,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: "center", // 型エラー解消のため修正
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  taskControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginVertical: 16,
    width: "100%",
  },
});
