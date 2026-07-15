

import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { Shift, ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

const mapShiftToShiftItem = (shift: Shift): ShiftItem => {
  const item: ShiftItem = {
    id: shift.id,
    userId: shift.userId || "",
    storeId: shift.storeId || "",
    nickname: shift.nickname || "",
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    type: shift.type || "user",
    isCompleted: shift.isCompleted || false,
    status: shift.status as ShiftStatus,
    duration: shift.duration?.toString() || "0",
    createdAt: shift.createdAt || new Date(),
    updatedAt: shift.updatedAt || new Date(),
    classes: Array.isArray(shift.classes) ? shift.classes : [],
  };

  if (shift.subject != null) {
    item.subject = shift.subject;
  }

  if (shift.requestedChanges?.[0]) {
    const rc: ShiftItem["requestedChanges"] = {
      startTime: shift.requestedChanges[0].startTime,
      endTime: shift.requestedChanges[0].endTime,
      date: shift.date,
    };
    if (shift.type != null) rc.type = shift.type;
    if (shift.subject != null) rc.subject = shift.subject;
    item.requestedChanges = rc;
  }

  return item;
};

export const useShifts = (storeId?: string) => {

  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShifts = useCallback(async () => {

    if (!storeId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {

      const rawShifts = await ServiceProvider.shifts.getShifts(storeId);

      const shiftsData = rawShifts
        .map(mapShiftToShiftItem)
        .filter((shift) => shift.storeId === storeId);

      setShifts(shiftsData);
    } catch (err) {

      setError(err as Error);
    } finally {

      setLoading(false);
    }
  }, [storeId]);

  const fetchShiftsByMonth = useCallback(
    async (year: number, month: number) => {
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const startDateStr = startDate.toISOString().split("T")[0] ?? "";
        const endDateStr = endDate.toISOString().split("T")[0] ?? "";

        const rawShifts = await ServiceProvider.shifts.getShifts(storeId);

        const shiftsData = rawShifts
          .map(mapShiftToShiftItem)

          .filter(
            (shift) =>
              shift.storeId === storeId &&
              shift.date >= startDateStr &&
              shift.date <= endDateStr
          )

          .sort((a, b) => {

            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare === 0) {

              return a.startTime.localeCompare(b.startTime);
            }
            return dateCompare;
          });

        setShifts(shiftsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [storeId]
  );

  useEffect(() => {
    if (storeId) {
      fetchShifts();
    } else {
      setShifts([]);
      setLoading(false);
    }
  }, [fetchShifts, storeId]);

  return {
    shifts,
    loading,
    error,
    fetchShifts,
    fetchShiftsByMonth,
  };
};
