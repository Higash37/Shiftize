

import { User, UserRole } from "@/common/common-models/model-user/UserModel";

export interface IAuthService {

  signIn(email: string, password: string): Promise<User>;

  signOut(): Promise<void>;

  getUserRole(user: { uid: string }): Promise<UserRole>;

  createUser(
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: UserRole,
    hourlyWage?: number,
    furigana?: string
  ): Promise<User>;

  updateUser(
    user: User,
    updates: {
      nickname?: string;
      furigana?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined>;

  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  createSecondaryEmailAccount(
    originalUser: { uid: string; nickname?: string; role?: string; color?: string; storeId?: string; hourlyWage?: number },
    realEmail: string,
    password: string
  ): Promise<void>;

  createInitialMasterUser(): Promise<void>;

  linkOAuthIdentity(provider: "google" | "apple"): Promise<void>;

  getLinkedIdentities(): Promise<Array<{ provider: string; email?: string }>>;

  unlinkOAuthIdentity(provider: "google" | "apple"): Promise<void>;

  getCurrentUser(): { uid: string; email: string | null; displayName: string | null } | null;

  onAuthStateChanged(callback: (user: { uid: string; email: string | null; displayName: string | null } | null) => void): () => void;
}
