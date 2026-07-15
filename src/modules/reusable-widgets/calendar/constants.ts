

import { Dimensions, Platform } from "react-native";
import { useMemo } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const BASE_CALENDAR_WIDTH_RATIO = 0.3;

export const CALENDAR_WIDTH = Math.min(
  SCREEN_WIDTH * BASE_CALENDAR_WIDTH_RATIO,
  500
);

export const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7);

export const DAY_HEIGHT = Math.floor(DAY_WIDTH * 0.6);

export const useResponsiveCalendarSize = () => {
  return useMemo(() => {

    const { width } = Dimensions.get("window");

    const isSmallScreen = width < 768;

    const scaleFactor = isSmallScreen ? 0.95 : 0.95;

    const calendarWidth = isSmallScreen
      ? width * 0.95 * scaleFactor
      : Math.min(width * BASE_CALENDAR_WIDTH_RATIO * scaleFactor, 430);

    const dayWidth = Math.floor(calendarWidth / 7);

    const dayHeight = Math.floor(dayWidth * (isSmallScreen ? 0.9 : 0.75));

    return {
      calendarWidth,
      dayWidth,
      dayHeight,
      isSmallScreen,
    };
  }, []);
};

import { getHolidaysSync } from "@/common/common-utils/util-settings/japaneseHolidays";

export const HOLIDAYS: { [key: string]: string } = new Proxy(
  {} as Record<string, string>,
  {

    get(_target, prop: string) {
      return getHolidaysSync()[prop];
    },

    has(_target, prop: string) {
      return prop in getHolidaysSync();
    },

    ownKeys() {
      return Object.keys(getHolidaysSync());
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      const holidays = getHolidaysSync();
      if (prop in holidays) {
        return { configurable: true, enumerable: true, value: holidays[prop] };
      }
      return undefined;
    },
  }
);

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export const PLATFORM_SPECIFIC = {
  isWeb: Platform.OS === "web",
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
};
