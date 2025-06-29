import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "@/services/firebase/firebase-core";

const auth = getAuth();

export const handleLogin = async (
  email: string,
  password: string,
  setError: (msg: string) => void
) => {
  try {
    console.log("ログイン試行:", { email, password });

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

    // currentPasswordと入力されたパスワードを照合
    console.log("パスワード照合:", {
      inputPassword: password,
      currentPassword: userData.currentPassword,
    });

    if (userData.currentPassword !== password) {
      throw new Error("パスワードが正しくありません");
    }

    // Firebase Authでのログイン（メールアドレスとcurrentPasswordを使用）
    console.log("Firebase Auth認証開始");
    await signInWithEmailAndPassword(auth, email, userData.currentPassword);
    console.log("Firebase Auth認証成功");
  } catch (err: any) {
    console.error("ログインエラー:", err);
    setError(err.message || "ログインに失敗しました");
  }
};
