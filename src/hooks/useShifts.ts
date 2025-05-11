import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { ShiftItem, ShiftStatus } from "@/types/shift";

export const useShifts = () => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
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
    };

    fetchShifts();
  }, []);

  return { shifts, loading, error };
};
