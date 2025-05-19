import { useState, useEffect } from "react";
import { User } from "@/modules/user/types/user";
import { getUsers } from "@/services/firebase/firebase-user";

// 内部でのみ使用するユーザー拡張インターフェース
interface ExtendedUser extends User {
  currentPassword?: string;
}

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
