import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { User } from "./auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"master" | "teacher" | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();
      setUser({
        uid: userCredential.user.uid,
        nickname: userData?.nickname || "",
        role: userData?.role || "teacher",
        email: userCredential.user.email || undefined,
      });
      setRole(userData?.role || "teacher");
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

        setUser({
          uid: firebaseUser.uid,
          nickname: userData?.nickname || "",
          role: userData?.role || "teacher",
          email: firebaseUser.email || undefined,
        });
        setRole(userData?.role || "teacher");
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
