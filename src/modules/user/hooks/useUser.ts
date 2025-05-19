import { useState, useEffect } from "react";
import { User } from "@/modules/user/types/user";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase-core";
import {
  getUsers as getUsersService,
  deleteUser,
  checkMasterExists,
  checkEmailExists,
} from "@/services/firebase/firebase-user";
import { createUser, updateUser } from "@/services/firebase/firebase-auth";

export const useUser = () => {
  const [users, setUsers] = useState<(User & { currentPassword?: string })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // UserServiceを利用してデータを取得
      const usersData = await getUsersService();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError("ユーザー情報の取得に失敗しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (
    email: string,
    password: string,
    nickname: string,
    role: "master" | "user"
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

      // マスターユーザーの場合、既存のマスターユーザーをチェック
      if (role === "master") {
        const hasMaster = await checkMasterExists();
        if (hasMaster) {
          throw new Error("マスターユーザーは既に存在します");
        }
      }

      // メールアドレスをニックネームから生成
      const userEmail =
        role === "master" ? "master@example.com" : `${nickname}@example.com`; // 一般ユーザーの場合、メールアドレスの重複をチェック
      if (role === "user") {
        const emailExists = await checkEmailExists(userEmail);
        if (emailExists) {
          throw new Error("このニックネームは既に使用されています");
        }
      }

      // Firebase AuthenticationとFirestoreにユーザーを作成
      const newUser = await createUser(userEmail, password);

      // ユーザー一覧を更新
      await fetchUsers();
      return newUser;
    } catch (err: any) {
      console.error("ユーザー作成エラー:", err);
      const errorMessage =
        err.code === "auth/weak-password"
          ? "パスワードは6文字以上で入力してください"
          : err.code === "auth/email-already-in-use"
          ? "このニックネームは既に使用されています"
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
      password?: string;
      role?: "master" | "user";
    }
  ): Promise<User | undefined> => {
    try {
      setLoading(true);
      const updatedUser = await updateUser(user, updates);

      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? updatedUser : u))
        );
      }

      await fetchUsers();
      return updatedUser;
    } catch (err) {
      setError("ユーザー情報の更新に失敗しました");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const removeUser = async (uid: string) => {
    try {
      setLoading(true);

      // UserServiceを使用してユーザーを削除
      await deleteUser(uid);

      // ユーザー一覧を更新
      await fetchUsers();
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
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
