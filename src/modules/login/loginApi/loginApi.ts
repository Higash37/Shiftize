import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "@/services/firebase/firebase";

const auth = getAuth();

export const handleLogin = async (
  email: string,
  password: string,
  setError: (msg: string) => void
) => {
  try {
    // Firestoreからユーザー情報を取得
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error("ユーザーが見つかりません");
    }

    const userData = userSnapshot.docs[0].data();

    // 削除フラグを確認
    if (userData.deleted) {
      throw new Error("このユーザーは削除されています");
    }

    // 通常のログイン処理
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    console.error("ログインエラー:", err);
    setError(err.message || "ログインに失敗しました");
  }
};
