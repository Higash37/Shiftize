

const DEFAULT_HOURLY_WAGE = 1100;

export const timeStringToMinutes = (timeString: string): number => {

  const [hoursStr, minutesStr] = timeString.split(":");

  const hours = hoursStr ? Number(hoursStr) : 0;
  const minutes = minutesStr ? Number(minutesStr) : 0;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new TypeError("Invalid time format");
  }

  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

export const calculateMinutesBetween = (
  startTime: string,
  endTime: string
): number => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  if (endMinutes < startMinutes) {

    return 24 * 60 - startMinutes + endMinutes;
  }

  return endMinutes - startMinutes;
};

export const calculateDurationHours = (
  startTime: string,
  endTime: string
): number => {
  const minutes = calculateMinutesBetween(startTime, endTime);
  return Math.round((minutes / 60) * 10) / 10;
};

export const compareByStartTime = (
  a: { startTime: string },
  b: { startTime: string }
): number => {
  return a.startTime.localeCompare(b.startTime);
};

export const compareByDateThenTime = (
  a: { date: string; startTime: string },
  b: { date: string; startTime: string }
): number => {
  const dateCompare = a.date.localeCompare(b.date);
  if (dateCompare !== 0) return dateCompare;
  return a.startTime.localeCompare(b.startTime);
};

export const calculateWage = (hourlyWage: number, minutes: number): number => {

  return hourlyWage * (minutes / 60);
};

export const calculateShiftWage = (
  shift: { startTime: string; endTime: string },
  hourlyWage: number = DEFAULT_HOURLY_WAGE
): { minutes: number; wage: number } => {
  const minutes = calculateMinutesBetween(shift.startTime, shift.endTime);
  const wage = calculateWage(hourlyWage, minutes);

  return {
    minutes,
    wage,
  };
};

export const isTimeOverlapping = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): boolean => {
  const r1Start = timeStringToMinutes(range1Start);
  const r1End = timeStringToMinutes(range1End);
  const r2Start = timeStringToMinutes(range2Start);
  const r2End = timeStringToMinutes(range2End);

  const r1EndAdjusted = r1End < r1Start ? r1End + 24 * 60 : r1End;
  const r2EndAdjusted = r2End < r2Start ? r2End + 24 * 60 : r2End;

  return (
    (r1Start <= r2Start && r2Start < r1EndAdjusted) ||
    (r2Start <= r1Start && r1Start < r2EndAdjusted)
  );
};

export const calculateOverlapMinutes = (
  range1Start: string,
  range1End: string,
  range2Start: string,
  range2End: string
): number => {
  const r1Start = timeStringToMinutes(range1Start);
  const r1End = timeStringToMinutes(range1End);
  const r2Start = timeStringToMinutes(range2Start);
  const r2End = timeStringToMinutes(range2End);

  const r1EndAdjusted = r1End < r1Start ? r1End + 24 * 60 : r1End;
  const r2EndAdjusted = r2End < r2Start ? r2End + 24 * 60 : r2End;

  if (r1EndAdjusted <= r2Start || r2EndAdjusted <= r1Start) {
    return 0;
  }

  const overlapStart = Math.max(r1Start, r2Start);
  const overlapEnd = Math.min(r1EndAdjusted, r2EndAdjusted);

  return overlapEnd - overlapStart;
};

import type { TimeSegmentType } from "@/common/common-models/model-shift/shiftTypes";

export const calculateWorkMinutesExcludingClasses = (
  shift: { startTime: string; endTime: string },
  classes: Array<{ startTime: string; endTime: string; typeId?: string }> = [],
  typesMap?: Record<string, TimeSegmentType>
): number => {

  const totalShiftMinutes = calculateMinutesBetween(
    shift.startTime,
    shift.endTime
  );

  if (!classes || classes.length === 0) {
    return totalShiftMinutes;
  }

  let totalOverlapMinutes = 0;

  for (const classTime of classes) {

    const segType = classTime.typeId ? typesMap?.[classTime.typeId] : undefined;

    const wageMode = segType?.wageMode ?? "exclude";

    if (wageMode === "include") continue;

    if (
      isTimeOverlapping(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      )
    ) {
      const overlapMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );
      totalOverlapMinutes += overlapMinutes;
    }
  }

  return totalShiftMinutes - totalOverlapMinutes;
};

export const calculateTotalWage = (
  shift: {
    startTime: string;
    endTime: string;
    classes?: Array<{ startTime: string; endTime: string; typeId?: string; typeName?: string }>;
  },
  hourlyWage: number = DEFAULT_HOURLY_WAGE,
  typesMap?: Record<string, TimeSegmentType>
): {
  totalMinutes: number;
  totalWage: number;
  details: { type: string; minutes: number; wage: number }[];
} => {

  const workMinutes = calculateWorkMinutesExcludingClasses(
    shift,
    shift.classes || [],
    typesMap
  );
  let totalWage = calculateWage(hourlyWage, workMinutes);

  const details: { type: string; minutes: number; wage: number }[] = [
    {
      type: "シフト（途中時間除外後）",
      minutes: workMinutes,
      wage: calculateWage(hourlyWage, workMinutes),
    },
  ];

  if (shift.classes && shift.classes.length > 0) {
    for (const classTime of shift.classes) {

      if (
        !isTimeOverlapping(
          shift.startTime,
          shift.endTime,
          classTime.startTime,
          classTime.endTime
        )
      ) continue;

      const segType = classTime.typeId ? typesMap?.[classTime.typeId] : undefined;
      const wageMode = segType?.wageMode ?? "exclude";
      const typeName = segType?.name || classTime.typeName || "授業";
      const classMinutes = calculateOverlapMinutes(
        shift.startTime,
        shift.endTime,
        classTime.startTime,
        classTime.endTime
      );

      if (wageMode === "exclude") {

        details.push({ type: `${typeName}（除外）`, minutes: classMinutes, wage: 0 });
      } else if (wageMode === "include") {

        details.push({ type: `${typeName}（含む）`, minutes: classMinutes, wage: calculateWage(hourlyWage, classMinutes) });
      } else if (wageMode === "custom_rate") {

        const customWage = calculateWage(segType?.customRate ?? 0, classMinutes);
        totalWage += customWage;
        details.push({ type: `${typeName}（別単価 ¥${segType?.customRate ?? 0}/時）`, minutes: classMinutes, wage: customWage });
      }
    }
  }

  return {
    totalMinutes: workMinutes,
    totalWage: Math.round(totalWage),
    details,
  };
};
