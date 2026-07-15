

import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";

export function generateTimeOptions(
  startHourInclusive: number = SHIFT_HOURS.START_HOUR_INCLUSIVE,
  endHourInclusive: number = SHIFT_HOURS.END_HOUR_INCLUSIVE,
  intervalMinutes: number = SHIFT_HOURS.TIME_INTERVAL_MINUTES
): string[] {

  const options = new Set<string>();

  for (let hour = startHourInclusive; hour <= endHourInclusive; hour++) {

    for (let minute = 0; minute < 60; minute += intervalMinutes) {

      const timeString = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      options.add(timeString);
    }
  }

  return Array.from(options).sort();
}

export function parseTimeString(dateStr: string, timeStr: string): Date | null {

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return null;

  const parts = timeStr.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  date.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  return date;
}
