import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

export const useShifts = (storeId?: string) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // シフトデータを取得する関数
  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const shiftsRef = collection(db, "shifts");
      let q = query(shiftsRef);

      // storeIdが指定されている場合はフィルタリング
      if (storeId) {
        q = query(shiftsRef, where("storeId", "==", storeId));
      }

      console.log("fetchShifts debug:", {
        storeId,
        hasStoreId: !!storeId,
      });

      const querySnapshot = await getDocs(q);

      console.log("fetchShifts result:", {
        docsCount: querySnapshot.docs.length,
      });

      const shiftsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // デバッグ用: classesの内容を出力
        console.log("shift data:", data);
        return {
          id: doc.id,
          userId: data.userId || "",
          storeId: data.storeId || "", // storeIdを追加
          nickname: data.nickname,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          type: data.type || "user",
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
            type: data.type || "user",
            subject: data.subject,
          })),
          classes: Array.isArray(data.classes) ? data.classes : [],
        } as ShiftItem;
      });

      setShifts(shiftsData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [storeId]); // storeIdを依存配列に追加

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

        // 日付範囲のみでクエリ（storeIdはJavaScriptでフィルタリング）
        const q = query(
          shiftsRef,
          where("date", ">=", startDateStr),
          where("date", "<=", endDateStr)
        );

        const querySnapshot = await getDocs(q);

        console.log("fetchShiftsByMonth debug:", {
          year,
          month,
          storeId,
          startDateStr,
          endDateStr,
          docsCount: querySnapshot.docs.length,
        });

        const shiftsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            // デバッグ用: シフトデータの内容を出力
            console.log("shift document:", {
              id: doc.id,
              data,
              hasStoreId: !!data.storeId,
              storeId: data.storeId,
            });
            return {
              id: doc.id,
              userId: data.userId || "",
              storeId: data.storeId || "", // storeIdを追加
              nickname: data.nickname,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              type: data.type || "user",
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
                subject: data.subject,
              })),
              classes: Array.isArray(data.classes) ? data.classes : [],
            } as ShiftItem;
          })
          // storeIdでJavaScriptフィルタリング
          .filter((shift) => !storeId || shift.storeId === storeId)
          // JavaScriptでソート
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare === 0) {
              return a.startTime.localeCompare(b.startTime);
            }
            return dateCompare;
          });

        setShifts(shiftsData);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching shifts by month:", err);
      } finally {
        setLoading(false);
      }
    },
    [storeId] // storeIdを依存配列に追加
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
