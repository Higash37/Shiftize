/**
 * Firebase ユーザー管理モジュール
 *
 * ユーザーデータの取得・管理を提供します。
 */

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { User, UserData } from "@/common/common-models/model-user/UserModel";
import { db } from "./firebase-core";

/**
 * ユーザー管理サービス
 * ユーザーデータの取得・管理を提供します
 */
export const UserService = {
  /**
   * 全ユーザーの一覧を取得します
   */
  getUsers: async (): Promise<(User & { currentPassword?: string })[]> => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          role: data.role || "user",
          nickname: data.nickname || "",
          currentPassword: data.currentPassword,
        };
      });
    } catch (error) {
      console.error("ユーザー一覧の取得に失敗しました:", error);
      throw error;
    }
  },

  /**
   * ユーザーを削除します
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      const userRef = doc(db, "users", id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error("ユーザーの削除に失敗しました:", error);
      throw error;
    }
  },
  /**
   * ユーザーデータを取得します
   */ getUserData: async (userId: string): Promise<UserData | null> => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          nickname: data.nickname,
          role: data.role,
          email: data.email,
          currentPassword: data.currentPassword,
          createdAt: data.createdAt.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error("ユーザーデータの取得に失敗しました:", error);
      throw error;
    }
  },

  /**
   * マスターユーザーが存在するか確認します
   */
  checkMasterExists: async (): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const masterQuery = query(usersRef, where("role", "==", "master"));
      const masterSnapshot = await getDocs(masterQuery);
      return !masterSnapshot.empty;
    } catch (error) {
      console.error("マスターユーザーの確認に失敗しました:", error);
      throw error;
    }
  },

  /**
   * メールアドレスが既に使用されているか確認します
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      return !emailSnapshot.empty;
    } catch (error) {
      console.error("メールアドレスの確認に失敗しました:", error);
      throw error;
    }
  },
};

// エクスポート
export const {
  getUsers,
  deleteUser,
  getUserData,
  checkMasterExists,
  checkEmailExists,
} = UserService;
