

import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";

const TIME_OPTIONS_CACHE = (() => {
  const options: string[] = [];
  for (let hour = SHIFT_HOURS.START_HOUR_INCLUSIVE; hour <= SHIFT_HOURS.END_HOUR_INCLUSIVE; hour++) {
    options.push(`${hour.toString().padStart(2, "0")}:00`);
    options.push(`${hour.toString().padStart(2, "0")}:15`);
    options.push(`${hour.toString().padStart(2, "0")}:30`);
    options.push(`${hour.toString().padStart(2, "0")}:45`);
  }
  return options;
})();

export function generateTimeOptions() {
  return TIME_OPTIONS_CACHE;
}

import { ShiftItem } from "@/common/common-models/ModelIndex";

export function groupShiftsByOverlap(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];

  return shifts
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((shift) => [shift]);
}

const shiftOverlapCache = new Map<string, boolean>();

export function groupNonOverlappingShifts(shifts: ShiftItem[]): ShiftItem[][] {
  if (!shifts || shifts.length === 0) return [];

  const sortedShifts = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groups: ShiftItem[][] = [];

  for (const shift of sortedShifts) {
    let addedToGroup = false;

    for (const group of groups) {

      const hasOverlap = group.some(existingShift =>
        shiftsOverlapCached(existingShift, shift)
      );

      if (!hasOverlap) {
        group.push(shift);
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      groups.push([shift]);
    }
  }

  return groups;
}

function shiftsOverlapCached(shift1: ShiftItem, shift2: ShiftItem): boolean {

  const key = shift1.id < shift2.id
    ? `${shift1.id}-${shift2.id}`
    : `${shift2.id}-${shift1.id}`;

  if (shiftOverlapCache.has(key)) {
    return shiftOverlapCache.get(key)!;
  }

  const result = shiftsOverlap(shift1, shift2);
  shiftOverlapCache.set(key, result);
  return result;
}

function shiftsOverlap(shift1: ShiftItem, shift2: ShiftItem): boolean {
  const start1 = timeToMinutes(shift1.startTime);
  const end1 = timeToMinutes(shift1.endTime);
  const start2 = timeToMinutes(shift2.startTime);
  const end2 = timeToMinutes(shift2.endTime);

  return start1 < end2 && start2 < end1;
}

const timeToMinutesCache = new Map<string, number>();

function timeToMinutes(time: string): number {
  if (timeToMinutesCache.has(time)) {
    return timeToMinutesCache.get(time)!;
  }

  const parts = time.split(':');
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  const result = (Number.isNaN(hours) ? 0 : hours) * 60 + (Number.isNaN(minutes) ? 0 : minutes);
  timeToMinutesCache.set(time, result);
  return result;
}

const timePositionCache = new Map<string, number>();

export function timeToPosition(time: string): number {
  if (timePositionCache.has(time)) {
    return timePositionCache.get(time)!;
  }

  const [hours, minutes] = time.split(":").map(Number);

  const totalMinutesFromStart = ((hours ?? 0) - SHIFT_HOURS.START_HOUR_INCLUSIVE) * 60 + (minutes ?? 0);
  const result = totalMinutesFromStart / 15;
  timePositionCache.set(time, result);
  return result;
}

export function positionToTime(position: number, timeGrid?: string[]): string {
  if (!timeGrid) {

    const totalMinutesFromStart = Math.round(position) * 15;
    const hours = Math.floor(totalMinutesFromStart / 60) + SHIFT_HOURS.START_HOUR_INCLUSIVE;
    const minutes = totalMinutesFromStart % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  const index = Math.floor(position);
  if (index >= 0 && index < timeGrid.length) {
    return timeGrid[index] ?? "00:00";
  }

  const fallbackStart = `${String(SHIFT_HOURS.START_HOUR_INCLUSIVE).padStart(2, "0")}:00`;
  const fallbackEnd = `${SHIFT_HOURS.END_HOUR_INCLUSIVE}:00`;

  return index < 0 ? (timeGrid[0] ?? fallbackStart) : (timeGrid.at(-1) ?? fallbackEnd);
}
