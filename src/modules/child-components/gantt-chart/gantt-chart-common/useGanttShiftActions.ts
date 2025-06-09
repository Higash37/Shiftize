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
        if (editingShift?.status === "deletion_requested") {
          newShiftData.status = "rejected"; // 削除申請中のシフトを却下状態に変更
        }
        // Master が直接却下にする場合の処理
        if (newShiftData.status === "rejected") {
          await updateDoc(doc(db, "shifts", editingShift.id), {
            ...newShiftData,
            updatedAt: serverTimestamp(),
          });
          if (onShiftUpdate) await onShiftUpdate();
          return;
        }
        await updateDoc(doc(db, "shifts", editingShift.id), {
          ...newShiftData,
          updatedAt: serverTimestamp(),
        });
      } else {
        if (newShiftData.status === "deleted") {
          newShiftData.status = "deletion_requested"; // 削除申請中に変更
        }
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

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new Error("ユーザーが未ログインです");

      const shiftRef = doc(db, "shifts", shiftId);
      console.log(`Updating shift ${shiftId} to status ${status}`); // デバッグ用ログ
      await updateDoc(shiftRef, { status });

      if (onShiftUpdate) {
        console.log("Calling onShiftUpdate callback"); // デバッグ用ログ
        await onShiftUpdate();
      }
    },
    [user, onShiftUpdate]
  );

  return {
    saveShift,
    deleteShift,
    updateShiftStatus,
  };
}
