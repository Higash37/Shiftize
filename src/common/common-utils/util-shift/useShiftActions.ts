import { useState, useEffect, useCallback } from "react";
import {
  getShifts,
  addShift,
  updateShift,
  approveShiftChanges,
} from "@/services/firebase/firebase";
import { useAuth } from "@/services/auth/useAuth";
import {
  Shift,
  ShiftItem,
  ShiftStatus,
} from "@/common/common-models/ModelIndex";

export const useShift = (storeId?: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, role } = useAuth();

  const fetchShifts = useCallback(async () => {
    if (!user) {
      console.log("fetchShifts: no user");
      return;
    }

    try {
      setLoading(true);
      console.log("fetchShifts called with:", {
        storeId,
        userUid: user?.uid,
        role,
      });
      const allShifts = await getShifts(storeId || user?.storeId);
      const filteredShifts =
        role === "master"
          ? allShifts
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid);
      console.log("fetchShifts result:", {
        allShiftsCount: allShifts.length,
        filteredShiftsCount: filteredShifts.length,
      });
      setShifts(filteredShifts);
    } catch (error) {
      console.error("シフトの取得に失敗しました:", error);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.storeId, role, storeId]); // 必要な依存関係のみ

  // ユーザー情報やroleが変更された時にデータを再取得
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (shiftData: Omit<Shift, "id">) => {
    try {
      // storeIdが指定されていない場合はユーザーのstoreIdを使用
      const shiftWithStoreId = {
        ...shiftData,
        storeId: shiftData.storeId || user?.storeId || "",
      };

      console.log("シフトデータを送信:", shiftWithStoreId); // デバッグ用ログ
      await addShift(shiftWithStoreId);
      await fetchShifts(); // データを即時更新
    } catch (error) {
      console.error("シフトの追加に失敗しました:", error);
      throw error;
    }
  };

  const editShift = async (shiftId: string, shiftData: Partial<Shift>) => {
    try {
      const updatedData: Partial<Shift> = {
        ...shiftData,
        status: "draft", // 型を明示的にキャスト
        requestedChanges: [
          {
            startTime: shiftData.startTime || "", // 空文字列でデフォルト値を設定
            endTime: shiftData.endTime || "", // 空文字列でデフォルト値を設定
            status: "draft",
            requestedAt: new Date(),
          },
        ],
      };
      await updateShift(shiftId, updatedData);
      await fetchShifts(); // データを即時更新
    } catch (error) {
      console.error("シフトの更新に失敗しました:", error);
      throw error;
    }
  };

  const markShiftAsDeleted = async (shiftId: string) => {
    try {
      await updateShift(shiftId, { status: "deleted" });
      await fetchShifts();
    } catch (error) {
      console.error("シフトの状態更新に失敗しました:", error);
      throw error;
    }
  };

  const approveShift = async (shiftId: string) => {
    try {
      await approveShiftChanges(shiftId); // マスターが承認する関数を呼び出し
      await fetchShifts(); // データを即時更新
    } catch (error) {
      console.error("シフトの承認に失敗しました:", error);
      throw error;
    }
  };

  const updateShiftStatus = async (shiftId: string, status: ShiftStatus) => {
    try {
      await updateShift(shiftId, { status });
      await fetchShifts(); // データを即時更新
    } catch (error) {
      console.error("シフトのステータス更新に失敗しました:", error);
      throw error;
    }
  };

  return {
    shifts,
    loading,
    fetchShifts,
    createShift,
    editShift,
    markShiftAsDeleted,
    approveShift,
    updateShiftStatus,
  };
};

export type { Shift };
