

export type UserRole = "master" | "user";

export interface User {

  uid: string;

  role: UserRole;

  nickname: string;

  furigana?: string;

  email?: string;

  storeId?: string;

  color?: string;

  hourlyWage?: number;

  currentPassword?: string;

  createdAt?: string;
}

export interface UserData {

  nickname: string;

  role: UserRole;

  email: string;

  currentPassword?: string;

  createdAt: Date;

  hourlyWage?: number;
}
