import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { User } from "./auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase-core";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"master" | "user" | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const signIn = async (email: string, password: string, storeId: string) => {
    console.log("signIn関数が呼び出されました", { email, storeId });
    setAuthError(null);

    try {
      // Firestoreからユーザー情報を取得
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      console.log("Firestoreクエリ結果:", {
        isEmpty: userSnapshot.empty,
        docCount: userSnapshot.docs.length,
      });

      if (userSnapshot.empty) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = userSnapshot.docs[0].data();
      console.log("取得したユーザーデータ:", userData);

      // 削除フラグを確認
      if (userData.deleted) {
        throw new Error("このユーザーは削除されています");
      }

      // storeIdの一致を確認
      if (userData.storeId !== storeId) {
        console.error("店舗IDが一致しません。", {
          expected: userData.storeId,
          received: storeId,
        });
        throw new Error("店舗IDが一致しません");
      }

      // currentPasswordと入力されたパスワードを照合
      console.log("パスワード照合:", {
        inputPassword: password,
        currentPassword: userData.currentPassword,
      });

      if (userData.currentPassword !== password) {
        throw new Error("パスワードが正しくありません");
      }

      // Firebase Authでのログイン（入力されたパスワードを使用）
      console.log("Firebase Auth認証開始");
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      console.log("Firebase Auth認証成功", userCredential);

      setUser({
        uid: userCredential.user.uid,
        nickname: userData.nickname,
        role: userData.role,
        email: userCredential.user.email || undefined,
        storeId: userData.storeId,
      });
      setRole(userData.role);
      setStoreId(userData.storeId);
      setAuthError(null);
      console.log("ユーザー情報が設定されました", { userData });
    } catch (error: any) {
      console.error("signIn関数内でエラーが発生しました", error);
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(error.message || "認証に失敗しました");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await getAuth().signOut();
      // ログアウト時は店舗IDを保持する（ユーザーが明示的にログアウトした場合のみクリア）
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(null);
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      // デバッグ時のみログを出力
      if (__DEV__) {
        console.log("onAuthStateChanged triggered:", {
          hasUser: !!firebaseUser,
          uid: firebaseUser?.uid,
          currentStoreId: storeId,
        });
      }

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();

        if (__DEV__) {
          console.log("Firestore user data:", userData);
        }

        if (userData) {
          // 削除フラグを確認
          if (userData.deleted) {
            console.error("削除されたユーザーです");
            await getAuth().signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("このユーザーは削除されています。");
            return;
          }

          // storeIdが設定されている場合のみチェック（ログイン時のみ）
          // 既に認証済みの場合は、再度チェックしない
          const userStoreId = userData.storeId || storeId;

          setUser({
            uid: firebaseUser.uid,
            nickname: userData.nickname,
            role: userData.role,
            email: firebaseUser.email || undefined,
            storeId: userStoreId,
          });
          setRole(userData.role);
          setStoreId(userStoreId);
          setAuthError(null); // 成功時はエラーをクリア
          console.log("ユーザー状態を設定:", {
            uid: firebaseUser.uid,
            storeId: userStoreId,
            role: userData.role,
          });
        } else {
          console.error("ユーザー情報が見つかりません。");
          // Firebase認証をログアウト
          await getAuth().signOut();
          setUser(null);
          setRole(null);
          setStoreId(null);
          setAuthError("ユーザー情報が見つかりません。");
        }
      } else {
        // ログアウト時のログは初回のみ表示
        if (user) {
          console.log("ユーザーがログアウトしました");
        }
        setUser(null);
        setRole(null);
        setStoreId(null);
        setAuthError(null); // ログアウト時はエラーをクリア
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // 依存関係を空にして、初回のみ実行

  return {
    user,
    loading,
    isAuthenticated: !!user && !authError, // エラーがある場合は認証済みとしない
    role,
    authError, // エラー状態を返す
    signIn,
    signOut,
  };
};
