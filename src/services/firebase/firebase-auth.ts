/**
 * Firebase 認証モジュール
 *
 * スタッフの認証と権限管理を提供します。
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { User } from "@/common/common-models/model-user/UserModel";
import { auth, db } from "./firebase-core";

/**
 * 認証関連のサービス
 * スタッフの認証と権限管理を提供します
 */
export const AuthService = {
  /**
   * ユーザーサインイン
   */
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      return {
        uid: firebaseUser.uid,
        nickname: firebaseUser.displayName || email.split("@")[0],
        role: email.startsWith("master@") ? "master" : "user",
      };
    } catch (error) {
      console.error("サインインエラー:", error);
      throw error;
    }
  },

  /**
   * ユーザーのロールを判定
   */
  getUserRole: async (user: any) => {
    const email = user.email;
    return email.startsWith("master@") ? "master" : "user";
  },

  /**
   * ユーザーのサインアウト
   */
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("サインアウトエラー:", error);
      throw error;
    }
  },

  /**
   * 新しいユーザーを作成
   */
  createUser: async (
    email: string,
    password: string,
    color?: string
  ): Promise<User> => {
    try {
      console.log("Creating user with email:", email);

      // 1. まずFirebase Authenticationでユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ).catch((error) => {
        console.error("Firebase Authentication error:", error);
        throw error;
      });

      const firebaseUser = userCredential.user;
      console.log("Firebase user created:", firebaseUser.uid);

      // 2. ユーザープロファイルを更新
      await updateProfile(firebaseUser, {
        displayName: email.split("@")[0],
      }).catch((error) => {
        console.error("Update profile error:", error);
        throw error;
      });

      // 3. Firestoreにユーザー情報を保存
      const userRef = doc(db, "users", firebaseUser.uid);
      const userData: any = {
        nickname: email.split("@")[0],
        role: email.startsWith("master@") ? "master" : "user",
        currentPassword: password,
        email: email,
        createdAt: new Date(),
      };
      if (color) userData.color = color;

      await setDoc(userRef, userData).catch((error) => {
        console.error("Firestore save error:", error);
        throw error;
      });

      console.log("User data saved to Firestore");

      // 4. 作成されたユーザー情報を返す
      return {
        uid: firebaseUser.uid,
        nickname: email.split("@")[0],
        role: email.startsWith("master@") ? "master" : "user",
        color: color,
      };
    } catch (error) {
      console.error("ユーザー作成エラー:", error);
      throw error;
    }
  },

  /**
   * 既存ユーザーを更新
   */
  updateUser: async (
    user: User,
    updates: {
      nickname?: string;
      password?: string;
      role?: "master" | "user";
      color?: string;
    }
  ): Promise<User | undefined> => {
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData: { [key: string]: any } = {};

      if (updates.nickname) {
        updateData.nickname = updates.nickname;
        updateData.displayName = updates.nickname;
      }
      if (updates.role) updateData.role = updates.role;
      if (updates.password) updateData.currentPassword = updates.password;
      if (updates.color) updateData.color = updates.color;

      await updateDoc(userRef, updateData);

      // Firebase Authenticationの更新
      const currentUser = auth.currentUser;
      if (currentUser) {
        if (updates.nickname) {
          await updateProfile(currentUser, {
            displayName: updates.nickname,
          });
        }

        if (updates.password) {
          // 現在のパスワードで再認証
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          if (userData?.currentPassword) {
            try {
              const credential = EmailAuthProvider.credential(
                currentUser.email!,
                userData.currentPassword
              );
              await reauthenticateWithCredential(currentUser, credential);
              await updatePassword(currentUser, updates.password);
              // 新しいパスワードで更新
              await updateDoc(userRef, {
                currentPassword: updates.password,
              });
            } catch (error) {
              console.error("パスワード更新エラー:", error);
              throw new Error("パスワードの更新に失敗しました");
            }
          }
        }
      }

      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        return {
          uid: updatedDoc.id,
          role: data.role as "master" | "user",
          nickname: data.nickname || "",
          color: data.color,
        };
      }
      return undefined;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * ユーザーのパスワードを変更します
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("ユーザーが認証されていません");
      }

      // 現在のパスワードで再認証
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // パスワードの更新
      await updatePassword(user, newPassword);

      // Firestoreのユーザーデータも更新
      if (user.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          currentPassword: newPassword,
        });
      }
    } catch (error: any) {
      console.error("パスワード変更エラー:", error);
      if (error.code === "auth/wrong-password") {
        throw new Error("現在のパスワードが正しくありません");
      } else if (error.code === "auth/weak-password") {
        throw new Error("パスワードは6文字以上で入力してください");
      }
      throw new Error("パスワードの変更に失敗しました");
    }
  },

  /**
   * 初期マスターユーザーの作成（必要な場合のみ使用）
   */
  createInitialMasterUser: async (): Promise<void> => {
    try {
      await AuthService.createUser("master@example.com", "123456");
      console.log("初期マスターユーザーを作成しました");
    } catch (error: any) {
      // すでにユーザーが存在する場合は無視
      if (error.code === "auth/email-already-in-use") {
        console.log("マスターユーザーは既に存在します");
        return;
      }
      console.error("初期マスターユーザーの作成に失敗しました:", error);
    }
  },
};

// エクスポート
export const {
  signIn,
  getUserRole,
  signOut: signOutUser,
  createUser,
  updateUser,
  changePassword,
  createInitialMasterUser,
} = AuthService;
