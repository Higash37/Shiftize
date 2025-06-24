import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { User } from "./auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
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
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      console.log("Firebase認証成功", userCredential);

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      console.log("Firestoreから取得したユーザーデータ", userDoc);

      let userData = userDoc.data();
      if (!userData) {
        console.error("ユーザーが存在しません。Firestoreのデータが空です。");
        await getAuth().signOut();
        setAuthError("ユーザーが存在しません。");
        throw new Error("ユーザーが存在しません。");
      }

      console.log("ユーザーデータの詳細:", {
        nickname: userData.nickname,
        role: userData.role,
        storeId: userData.storeId,
        inputStoreId: storeId,
        storeIdMatch: userData.storeId === storeId,
      });

      if (!userData.storeId) {
        console.error("ユーザーデータにstoreIdが設定されていません。");
        await getAuth().signOut();
        setAuthError("ユーザーデータにstoreIdが設定されていません。");
        throw new Error("ユーザーデータにstoreIdが設定されていません。");
      }

      if (userData.storeId !== storeId) {
        console.error("店舗IDが一致しません。", {
          expected: userData.storeId,
          received: storeId,
          match: userData.storeId === storeId,
        });
        await getAuth().signOut();
        setAuthError("店舗IDが一致しません。");
        throw new Error("店舗IDが一致しません。");
      }

      console.log("storeId認証成功:", storeId);

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
    } catch (error) {
      console.error("signIn関数内でエラーが発生しました", error);
      setUser(null);
      setRole(null);
      setStoreId(null);
      if (!authError) {
        setAuthError("認証に失敗しました。");
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await getAuth().signOut();
      // ログアウト時に店舗IDを削除
      await StoreIdStorage.clearStoreId();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      console.log("onAuthStateChanged triggered:", {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        currentStoreId: storeId,
      });

      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();

        console.log("Firestore user data:", userData);

        if (userData) {
          // storeIdが設定されている場合のみチェック
          if (storeId && (!userData.storeId || userData.storeId !== storeId)) {
            console.error(
              "ユーザーに店舗IDが設定されていないか、一致しません。",
              {
                userStoreId: userData.storeId,
                currentStoreId: storeId,
                match: userData.storeId === storeId,
              }
            );
            // Firebase認証をログアウト
            await getAuth().signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("店舗IDが一致しません。");
            return;
          }

          // storeIdが設定されていない場合は、ユーザーデータから取得
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
        console.log("ユーザーがログアウトしました");
        setUser(null);
        setRole(null);
        setStoreId(null);
        setAuthError(null); // ログアウト時はエラーをクリア
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

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
