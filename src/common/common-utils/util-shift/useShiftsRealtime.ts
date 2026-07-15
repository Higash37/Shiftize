

import { useState, useEffect, useCallback, useRef } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ShiftItem } from "@/common/common-models/ModelIndex";

export const useShiftsRealtime = (storeId?: string) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShiftsByMonth = useCallback(
    (year: number, month: number): (() => void) | null => {
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      try {

        const unsubscribe = ServiceProvider.shifts.onShiftsByMonth(
          storeId,
          year,
          month,
          (shiftsData) => {
            setShifts(shiftsData);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        return null;
      }
    },
    [storeId]
  );

  useEffect(() => {
    if (!storeId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    const unsubscribe = ServiceProvider.shifts.onShiftsChanged(
      storeId,
      (shiftsData) => {
        setShifts(shiftsData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  const refetch = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await ServiceProvider.shifts.getShiftItems(storeId);
      setShifts(data);
    } catch (err) {
      setError(err as Error);
    }
  }, [storeId]);

  return {
    shifts,
    loading,
    error,
    fetchShiftsByMonth,
    refetch,
  };
};

export const useShiftsByMonth = (
  storeId: string | undefined,
  initialYear: number,
  initialMonth: number
) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const unsubRef = useRef<(() => void) | null>(null);
  const currentPeriodRef = useRef({ year: initialYear, month: initialMonth });

  const subscribe = useCallback(
    (year: number, month: number) => {

      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      currentPeriodRef.current = { year, month };

      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {

        const unsub = ServiceProvider.shifts.onShiftsByMonth(
          storeId,
          year,
          month,
          (data) => {
            setShifts(data);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          }
        );
        unsubRef.current = unsub;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [storeId]
  );

  useEffect(() => {
    subscribe(initialYear, initialMonth);

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [storeId, initialYear, initialMonth, subscribe]);

  const changeMonth = useCallback(
    (year: number, month: number) => {
      subscribe(year, month);
    },
    [subscribe]
  );

  const refetch = useCallback(async () => {
    if (!storeId) return;
    const { year, month } = currentPeriodRef.current;
    try {
      const data = await ServiceProvider.shifts.getShiftsByMonth(storeId, year, month);
      setShifts(data);
    } catch (err) {
      setError(err as Error);
    }
  }, [storeId]);

  return {
    shifts,
    loading,
    error,
    changeMonth,
    refetch,
  };
};
