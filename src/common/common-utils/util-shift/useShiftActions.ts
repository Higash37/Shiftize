

import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";
import { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";

export const useShift = (storeId?: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, role } = useAuth();

  const shiftActor =
    user && role
      ? {
          userId: user.uid,
          nickname: user.nickname || "未設定",
          role: role === "master" ? ("master" as const) : ("teacher" as const),
        }
      : null;

  const fetchShifts = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const targetStoreId = storeId || user?.storeId;
      if (!targetStoreId) {
        throw new Error("Store ID is required");
      }
      const allShifts = await ServiceProvider.shifts.getShifts(targetStoreId);

      const filteredShifts =
        role === "master"
          ? allShifts  
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid); 

      setShifts(filteredShifts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "シフトの取得に失敗しました";
      setError(errorMessage);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.storeId, role, storeId]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (shiftData: Omit<Shift, "id">) => {
    try {

      const shiftWithStoreId = {
        ...shiftData,
        storeId: shiftData.storeId || user?.storeId || "",
      };

      await ServiceProvider.shifts.addShift(
        shiftWithStoreId,
        shiftActor || undefined
      );
      await fetchShifts(); 
    } catch (err) {
      throw err; 
    }
  };

  const editShift = async (shiftId: string, shiftData: Partial<Shift>) => {
    try {
      const updatedData: Partial<Shift> = {
        ...shiftData,
        status: "draft", 
        requestedChanges: [
          {
            startTime: shiftData.startTime || "",
            endTime: shiftData.endTime || "",
            status: "draft",
            requestedAt: new Date(), 
          },
        ],
      };
      await ServiceProvider.shifts.updateShift(
        shiftId,
        updatedData,
        shiftActor || undefined
      );
      await fetchShifts(); 
    } catch (err) {
      throw err;
    }
  };

  const markShiftAsDeleted = async (shiftId: string, reason?: string) => {
    try {
      await ServiceProvider.shifts.markShiftAsDeleted(
        shiftId,
        shiftActor || undefined,
        reason
      );
      await fetchShifts(); 
    } catch (err) {
      throw err;
    }
  };

  const approveShift = async (shiftId: string) => {
    try {
      await ServiceProvider.shifts.approveShiftChanges(
        shiftId,
        shiftActor || undefined
      );
      await fetchShifts(); 
    } catch (err) {
      throw err;
    }
  };

  const updateShiftStatus = async (shiftId: string, status: ShiftStatus) => {
    try {
      await ServiceProvider.shifts.updateShift(
        shiftId,
        { status },
        shiftActor || undefined
      );
      await fetchShifts(); 
    } catch (err) {
      throw err;
    }
  };

  return {
    shifts,             
    loading,            
    error,              
    fetchShifts,        
    createShift,        
    editShift,          
    markShiftAsDeleted, 
    approveShift,       
    updateShiftStatus,  
    debugInfo: { service: "ServiceProvider.shifts" }, 
  };
};

export type { Shift } from "@/common/common-models/ModelIndex";
