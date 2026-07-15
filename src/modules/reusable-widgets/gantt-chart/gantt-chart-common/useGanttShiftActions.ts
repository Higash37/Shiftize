

import { useCallback, useRef } from "react";
import {
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
} from "@/common/common-models/ModelIndex";
import { ServiceProvider } from "@/services/ServiceProvider";
import { AuthError } from "@/common/common-errors/AppErrors";
import { createActor } from "@/services/shift-history/shiftHistoryLogger";

export interface UseGanttShiftActionsProps {
  user: { uid: string; storeId?: string; nickname?: string; role?: string } | null;
  users?: Array<{ uid: string; color?: string; nickname?: string }>;
  onShiftUpdate?: () => Promise<void> | void;
  refreshPage?: () => void; 
}

export function useGanttShiftActions({
  user,
  users = [],
  onShiftUpdate,
  refreshPage: _refreshPage,
}: UseGanttShiftActionsProps) {

  const savingRef = useRef(false);

  const buildActor = useCallback(() => createActor(user), [user]);

  const updateExistingShift = async (
    editingShift: ShiftItem,
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
    const actor = buildActor();

    if (editingShift.status === "deletion_requested") {
      newShiftData.status = "rejected";
    }

    if (newShiftData.status === "rejected") {
      await ServiceProvider.shifts.updateShift(
        editingShift.id,
        { ...newShiftData, updatedAt: new Date() },
        actor
      );
      return;
    }

    const isApproving =
      editingShift.status !== newShiftData.status &&
      newShiftData.status === "approved";

    if (isApproving) {
      await ServiceProvider.shifts.approveShiftChanges(editingShift.id, actor);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...otherChanges } = newShiftData;
      if (Object.keys(otherChanges).length > 0) {
        await ServiceProvider.shifts.updateShift(
          editingShift.id,
          { ...otherChanges, updatedAt: new Date() },
          actor
        );
      }
      return;
    }

    await ServiceProvider.shifts.updateShift(
      editingShift.id,
      { ...newShiftData, updatedAt: new Date() },
      actor
    );
  };

  const createNewShift = async (
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
    const actor = buildActor();

    if (newShiftData.status === "deleted") {
      newShiftData.status = "deletion_requested";
    }

    await ServiceProvider.shifts.addShift(
      {
        ...newShiftData,
        storeId: user?.storeId || "",
        type: "user" as const,
        isCompleted: false,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      actor
    );
  };

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
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        if (editingShift) {
          await updateExistingShift(editingShift, newShiftData);
        } else {
          await createNewShift(newShiftData);
        }

        onShiftUpdate?.();
      } finally {
        savingRef.current = false;
      }
    },
    [user, users, onShiftUpdate]
  );

  const deleteShift = useCallback(
    async (shift: { id: string; status: string }) => {
      await ServiceProvider.shifts.markShiftAsDeleted(shift.id, buildActor());
      onShiftUpdate?.();
    },
    [user, onShiftUpdate]
  );

  const updateShiftStatus = useCallback(
    async (shiftId: string, status: ShiftStatus) => {
      if (!user) throw new AuthError("ユーザーが未ログインです");

      const actor = buildActor()!;

      if (status === "approved") {
        await ServiceProvider.shifts.approveShiftChanges(shiftId, actor);
      } else {
        await ServiceProvider.shifts.updateShift(shiftId, { status }, actor);
      }

      onShiftUpdate?.();
    },
    [user, onShiftUpdate]
  );

  return {
    saveShift,
    deleteShift,
    updateShiftStatus,
  };
}
