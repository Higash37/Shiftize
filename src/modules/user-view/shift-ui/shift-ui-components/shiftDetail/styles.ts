import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

export const shiftDetailsViewStyles = StyleSheet.create({
  detailsContainer: {
    width: "100%",
    maxWidth: IS_TABLET ? 600 : "95%",
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: IS_SMALL_DEVICE ? 8 : 12,
    marginTop: -8,
    marginBottom: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export const shiftTimeSlotStyles = StyleSheet.create({
  timeSlot: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  timeSlotText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
  },
  timeSlotType: {
    width: 60,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
  },
  timeSlotTime: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
});
