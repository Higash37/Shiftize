import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { ShiftItem, ShiftStatus } from "@/types/shift";

export const useShifts = () => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // シフトデータを取得する関数
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const shiftsRef = collection(db, "shifts");
      const q = query(shiftsRef);
      const querySnapshot = await getDocs(q);

      const shiftsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || "",
          nickname: data.nickname,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: data.type || "staff",
          subject: data.subject,
          isCompleted: data.isCompleted || false,
          status: data.status as ShiftStatus,
          duration: data.duration?.toString() || "0",
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          requestedChanges: data.requestedChanges?.map((change: any) => ({
            startTime: change.startTime,
            endTime: change.endTime,
            date: data.date,
            type: data.type || "staff",
            subject: data.subject,
          })),
        } as ShiftItem;
      });

      setShifts(shiftsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 特定の月のシフトデータを取得する関数
  const fetchShiftsByMonth = useCallback(
    async (year: number, month: number) => {
      setLoading(true);
      try {
        // 指定した月の最初と最後の日
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        // ISO文字列形式に変換 (YYYY-MM-DD)
        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        const shiftsRef = collection(db, "shifts");
        // dateフィールドが指定した月の範囲内のものを取得
        const q = query(
          shiftsRef,
          where("date", ">=", startDateStr),
          where("date", "<=", endDateStr)
        );

        const querySnapshot = await getDocs(q);

        const shiftsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || "",
            nickname: data.nickname,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            type: data.type || "staff",
            subject: data.subject,
            isCompleted: data.isCompleted || false,
            status: data.status as ShiftStatus,
            duration: data.duration?.toString() || "0",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            requestedChanges: data.requestedChanges?.map((change: any) => ({
              startTime: change.startTime,
              endTime: change.endTime,
              date: data.date,
              type: data.type || "staff",
              subject: data.subject,
            })),
            classes: data.classes || [],
          } as ShiftItem;
        });

        setShifts(shiftsData);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching shifts by month:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // コンポーネントマウント時に初期データを取得
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);
  return {
    shifts,
    loading,
    error,
    fetchShifts,
    fetchShiftsByMonth,
  };
};
