export interface AuthCredential {
  nickname: string; // 表示名（実名は絶対に使わない）
  password: string; // ログインパスワードこちらで管理
}

export interface AuthUser {
  id: string; // Firebase UID など
  nickname: string; // 表示名（実名は絶対に使わない）
  role: "staff" | "tutor" | "both"; // 役職
  isActive: boolean; //ログイン許可フラグ
}
