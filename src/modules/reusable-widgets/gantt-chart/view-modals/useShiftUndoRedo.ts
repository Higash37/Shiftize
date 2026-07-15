

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/services/supabase/supabase-client";

export interface ShiftSnapshot {
  startTime?: string;
  endTime?: string;
  userId?: string;
  nickname?: string;
  status?: string;
  date?: string;
  classes?: unknown[];
}

export interface UseShiftUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => ShiftSnapshot | null;
  redo: () => ShiftSnapshot | null;
  historyCount: number;
  currentIndex: number;
}

export const useShiftUndoRedo = (
  shiftId: string | undefined,
  storeId: string | undefined
): UseShiftUndoRedoReturn => {
  const [snapshots, setSnapshots] = useState<ShiftSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!shiftId || !storeId) {
      setSnapshots([]);
      setCurrentIndex(-1);
      return;
    }

    const fetchHistory = async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("shift_change_logs")
        .select("prev_snapshot, next_snapshot, action")
        .eq("shift_id", shiftId)
        .eq("store_id", storeId)
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        setSnapshots([]);
        setCurrentIndex(-1);
        return;
      }

      const timeline: ShiftSnapshot[] = [];

      const firstEntry = data[0];
      const firstPrev = firstEntry?.prev_snapshot as ShiftSnapshot | null;
      if (firstPrev && Object.keys(firstPrev).length > 0) {
        timeline.push(firstPrev);
      }

      for (const entry of data) {
        const next = entry.next_snapshot as ShiftSnapshot | null;
        if (next && Object.keys(next).length > 0) {
          timeline.push(next);
        }
      }

      setSnapshots(timeline);

      setCurrentIndex(timeline.length - 1);
    };

    fetchHistory();
  }, [shiftId, storeId]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < snapshots.length - 1;

  const undo = useCallback((): ShiftSnapshot | null => {
    if (!canUndo) return null;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return snapshots[newIndex] ?? null;
  }, [canUndo, currentIndex, snapshots]);

  const redo = useCallback((): ShiftSnapshot | null => {
    if (!canRedo) return null;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return snapshots[newIndex] ?? null;
  }, [canRedo, currentIndex, snapshots]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    historyCount: snapshots.length,
    currentIndex,
  };
};
