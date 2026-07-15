

import { HOLIDAYS } from "@/modules/reusable-widgets/calendar/constants";

export const isSunday = (date: string): boolean => {

  return new Date(date).getDay() === 0;
};

export const isHoliday = (date: string): boolean => {
  return Boolean(HOLIDAYS[date]);
};

export const isSundayOrHoliday = (date: string): boolean => {
  return isSunday(date) || isHoliday(date);
};

export const getDateBackgroundColor = (date: string): string => {
  if (isSundayOrHoliday(date)) {

    return "rgba(0, 0, 0, 0.05)";
  }
  return "transparent";
};

export const getDateTextColor = (date: string): string => {
  if (isSundayOrHoliday(date)) {
    return "#ff0000"; 
  }
  return "#000000";   
};
