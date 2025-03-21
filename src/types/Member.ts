export type Role = "staff" | "tutor" | "both";

export interface Member {
  id: string; // Firebase UID など
  nickname: string; // 表示名（実名は絶対に使わない）
  role: Role; // 役職
  color: string; // ガントチャートやリストの色
  grade?: string; // 任意：大学3年など
  subjects?: string[]; // 例：['英語', '数学'] など
  isActive: boolean; //ログイン許可フラグ
}
