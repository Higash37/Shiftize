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
      // ステータスに応じて仕様通りに分岐
      if (shift.status === "deleted") {
        // 物理削除
        await deleteDoc(doc(db, "shifts", shift.id));
      } else if (shift.status === "pending" || shift.status === "rejected") {
        // 直接削除
        await updateDoc(doc(db, "shifts", shift.id), {
          status: "deleted",
          updatedAt: serverTimestamp(),
        });
      } else if (shift.status === "approved") {
        // 削除申請
        await updateDoc(doc(db, "shifts", shift.id), {
          status: "deletion_requested",
          updatedAt: serverTimestamp(),
        });
      } else if (shift.status === "deletion_requested") {
        // マスターによる承認で完全削除
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
