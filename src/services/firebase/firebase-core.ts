/**
 * Firebase コア設定モジュール
 *
 * Firebaseの初期化と基本的なサービス (認証、データベース) へのアクセスを提供します。
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase初期化とコア設定
 */
const FirebaseCore = (() => {
  // プライベート設定
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  // アプリ初期化
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  return {
    app,
    auth,
    db,
  };
})();

// Firebase認証とデータベース参照をエクスポート
export const auth = FirebaseCore.auth;
export const db = FirebaseCore.db;
export const app = FirebaseCore.app;
