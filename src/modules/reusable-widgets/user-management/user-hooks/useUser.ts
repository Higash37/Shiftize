
import { useState, useEffect } from "react";
import { User, UserRole } from "@/common/common-models/model-user/UserModel";
import { ServiceProvider } from "@/services/ServiceProvider";

export const useUser = (storeId?: string) => {
  const [users, setUsers] = useState<(User & { currentPassword?: string })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      fetchUsers();
    }
  }, [storeId]);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await ServiceProvider.users.getUsers(storeId);
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError("ユーザー情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const silentRefresh = async () => {
    try {
      const userData = await ServiceProvider.users.getUsers(storeId);
      setUsers(userData);
    } catch {

    }
  };
  const addUser = async (
    email: string,
    password: string,
    nickname: string,
    role: UserRole,
    color?: string,
    storeId?: string,
    hourlyWage?: number,
    furigana?: string,
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!nickname) {
        throw new Error("ニックネームを入力してください");
      }
      if (password.length < 6) {
        throw new Error("パスワードは6文字以上で入力してください");
      }
      if (!storeId) {
        throw new Error("店舗IDを入力してください");
      }

      if (role === "master") {
        const hasMaster = await ServiceProvider.users.checkMasterExists(storeId);
        if (hasMaster) {
          throw new Error("マスターユーザーは既に存在します");
        }
      }

      const sanitizeForEmail = (str: string) =>
        str
          .normalize("NFKC")
          .replace(/\s+/g, "")
          .replace(/[^\p{L}\p{N}]/gu, "")
          .toLowerCase();

      const userEmail =
        email ||
        (role === "master"
          ? `${sanitizeForEmail(storeId || "store")}master@example.com`
          : `${sanitizeForEmail(storeId || "store")}${sanitizeForEmail(
              nickname,
            )}@example.com`);

      try {
        const emailExists = await ServiceProvider.users.checkEmailExists(userEmail, storeId);
        if (emailExists) {
          throw new Error(
            email
              ? "このメールアドレスは既に使用されています"
              : "このニックネームは既に使用されています",
          );
        }
      } catch (emailCheckError: any) {
        if (emailCheckError.message === "Query timeout after 10 seconds") {

        } else {
          throw emailCheckError;
        }
      }

      const newUser = await ServiceProvider.auth.createUser(
        userEmail,
        password,
        nickname,
        color,
        storeId,
        role,
        hourlyWage,
        furigana,
      );

      await fetchUsers();
      return newUser;
    } catch (err: any) {
      const errorMessage =
        err.code === "auth/weak-password"
          ? "パスワードは6文字以上で入力してください"
          : err.code === "auth/email-already-in-use"
          ? "このメールアドレス・ニックネームは既に使用されています"
          : err.code === "auth/invalid-email"
          ? "メールアドレスの形式が無効です"
          : err.code === "auth/operation-not-allowed"
          ? "このプロジェクトでメール認証が無効になっています"
          : err.message || "ユーザーの作成に失敗しました";

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (
    user: User,
    updates: {
      nickname?: string;
      furigana?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      color?: string;
      storeId?: string;
    },
  ): Promise<User | undefined> => {
    try {
      const updatedUser = await ServiceProvider.auth.updateUser(user, updates);

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? updatedUser : u)),
        );
      }

      silentRefresh();
      return updatedUser;
    } catch (err) {
      setError("ユーザー情報の更新に失敗しました");
      throw err;
    }
  };

  const removeUser = async (uid: string) => {
    try {
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      await ServiceProvider.users.deleteUser(uid);
      silentRefresh();
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
      throw err;
    }
  };
  return {
    users,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    refreshUsers: fetchUsers,
    setUsers,
  };
};
