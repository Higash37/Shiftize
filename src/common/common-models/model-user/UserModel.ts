/**
 * ユーザー関連の型定義
 */

/**
 * ユーザーの基本情報
 */
export interface User {
  uid: string;
  role: "master" | "user";
  nickname: string;
  color?: string; // 講師ごとの色
}

/**
 * ユーザーデータの詳細情報
 */
export interface UserData {
  nickname: string;
  role: "master" | "user";
  email: string;
  currentPassword?: string;
  createdAt: Date;
}
