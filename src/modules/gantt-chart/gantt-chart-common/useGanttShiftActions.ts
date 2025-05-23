import { useCallback } from "react";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";

export interface UseGanttShiftActionsProps {
  user: { uid: string } | null;
  onShiftUpdate?: () => Promise<void> | void;
}

export function useGanttShiftActions({
  user,
  onShiftUpdate,
}: UseGanttShiftActionsProps) {
  // シフト保存（追加・編集）
  const saveShift = useCallback(
    async (
      editingShift: ShiftItem | null,
      newShiftData: {
        date: string;
        startTime: string;
        endTime: string;
        userId: string;
        nickname: string;
        status: ShiftStatus;
        classes: ClassTimeSlot[];
      }
    ) => {
      if (editingShift) {
        await updateDoc(doc(db, "shifts", editingShift.id), {
          ...newShiftData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "shifts"), {
          ...newShiftData,
          status: "approved",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          userId: user?.uid,
        });
      }
      if (onShiftUpdate) await onShiftUpdate();
    },
    [user, onShiftUpdate]
  );

  // シフト削除
  const deleteShift = useCallback(
    async (shift: { id: string; status: string }) => {
      if (shift.status === "deleted") {
        await deleteDoc(doc(db, "shifts", shift.id));
      } else {
        await updateDoc(doc(db, "shifts", shift.id), {
          status: "deleted",
          updatedAt: serverTimestamp(),
        });
      }
      if (onShiftUpdate) await onShiftUpdate();
    },
    [onShiftUpdate]
  );

  return { saveShift, deleteShift };
}
