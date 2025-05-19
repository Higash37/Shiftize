/**
 * Firebase 統合モジュール
 *
 * このファイルはFirebase関連の機能を各サブモジュールから集約し、
 * アプリケーション全体で使用するためのインターフェースを提供します。
 */

// Firebaseコア機能のインポート
export { auth, db, app } from "./firebase-core";

// Firebase認証モジュールからのインポート
export {
  signIn,
  getUserRole,
  signOutUser,
  createUser,
  updateUser,
  changePassword,
  createInitialMasterUser,
  AuthService,
} from "./firebase-auth";

// Firebaseシフト管理モジュールからのインポート
export {
  getShifts,
  addShift,
  updateShift,
  markShiftAsDeleted,
  approveShiftChanges,
  markShiftAsCompleted,
  ShiftService,
} from "./firebase-shift";

// Firebaseユーザー管理モジュールからのインポート
export {
  getUsers,
  deleteUser,
  getUserData,
  checkMasterExists,
  checkEmailExists,
  UserService,
  UserData,
} from "./firebase-user";

// ユーザーの型をエクスポート
export { User } from "@/modules/user/types/user";
