import { useState, useEffect } from "react";
import { getUsers } from "@/services/firebase/firebase-user";
import { ExtendedUser } from "../user-types/components";

export const useUsers = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // UserServiceを利用してデータを取得
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
