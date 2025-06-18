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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"master" | "user" | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

      // Firestoreからユーザー情報を取得
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      let userData = userDoc.data();

      // ユーザー情報が存在しない場合は新規作成
      if (!userData) {
        const isMaster = email.startsWith("master@");
        userData = {
          nickname: email.split("@")[0],
          role: isMaster ? "master" : "user",
          email: email,
          createdAt: new Date(),
        };
        await setDoc(doc(db, "users", userCredential.user.uid), userData);
      }

      setUser({
        uid: userCredential.user.uid,
        nickname: userData.nickname,
        role: userData.role,
        email: userCredential.user.email || undefined,
      });
      setRole(userData.role);
    } catch (error) {
      console.error("ログインに失敗しました:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await getAuth().signOut();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        // Firestoreからユーザー情報を取得
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();

        if (userData) {
          setUser({
            uid: firebaseUser.uid,
            nickname: userData.nickname,
            role: userData.role,
            email: firebaseUser.email || undefined,
          });
          setRole(userData.role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role,
    signIn,
    signOut,
  };
};
