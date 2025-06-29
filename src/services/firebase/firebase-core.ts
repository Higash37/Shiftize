/**
 * Firebase コア設定モジュール
 *
 * Firebaseの初期化と基本的なサービス (認証、データベース) へのアクセスを提供します。
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

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

  console.log("Firebase設定確認:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey,
  });

  // アプリ初期化
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Web環境での認証永続化設定
  if (Platform.OS === "web") {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("認証永続化の設定に失敗しました:", error);
    });
  }

  return {
    app,
    auth,
    db,
    firebaseConfig,
  };
})();

// Firebase認証とデータベース参照をエクスポート
export const auth = FirebaseCore.auth;
export const db = FirebaseCore.db;
export const app = FirebaseCore.app;
export const firebaseConfig = FirebaseCore.firebaseConfig;
