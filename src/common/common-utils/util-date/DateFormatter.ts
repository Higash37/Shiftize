

export const formatDate = (date: Date): string => {

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date): string => {

  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const addDays = (date: Date, days: number): Date => {

  const result = new Date(date);

  result.setDate(result.getDate() + days);
  return result;
};

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dateArray: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {

    dateArray.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dateArray;
};

export const toISODateString = (date: Date): string => {

  const isoString = date.toISOString().split("T")[0];
  if (!isoString) {
    throw new Error("Failed to format date to ISO string");
  }
  return isoString;
};

export const getJapaneseDayOfWeek = (date: Date): string => {

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dayName = dayNames[date.getDay()];
  if (!dayName) {
    throw new Error("Invalid day of week");
  }
  return dayName;
};

export const getFirstDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

export const getLastDayOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0);
};
