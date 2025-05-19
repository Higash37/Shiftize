import { useState, useEffect } from "react";
import {
  getShifts,
  addShift,
  updateShift,
  approveShiftChanges,
} from "@/services/firebase/firebase";
import { useAuth } from "@/services/auth/useAuth";
import { Shift, ShiftItem, ShiftStatus } from "@/modules/shift/types/shift";

export const useShift = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, role } = useAuth();

  const fetchShifts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const allShifts = await getShifts();
      const filteredShifts =
        role === "master"
          ? allShifts
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid);
      setShifts(filteredShifts);
    } catch (error) {
      console.error("シフトの取得に失敗しました:", error);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  // ユーザー情報やroleが変更された時にデータを再取得
  useEffect(() => {
    fetchShifts();
  }, [user, role]);

  const createShift = async (shiftData: Omit<Shift, "id">) => {
    try {
      console.log("シフトデータを送信:", shiftData); // デバッグ用ログ
      await addShift(shiftData);
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
