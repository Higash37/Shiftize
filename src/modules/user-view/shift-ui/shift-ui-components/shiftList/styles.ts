import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

export const shiftListItemStyles = StyleSheet.create({
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: IS_SMALL_DEVICE ? 8 : 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
    ...getPlatformShadow(2),
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
    backgroundColor: colors.selected,
  },
});

export const shiftListViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    marginTop: 0,
    marginBottom: 8,
    alignItems: "center",
    width: "100%",
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  listContentContainer: {
    alignItems: "center",
    paddingHorizontal: IS_SMALL_DEVICE ? 8 : 16,
  },
  noShiftContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
  },
  noShiftText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
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
