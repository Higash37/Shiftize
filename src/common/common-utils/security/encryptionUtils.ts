

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import CryptoJS from "crypto-js";
import { SecurityLogger, safeStringCompare } from "./securityUtils";
import type { UserRole } from "@/common/common-models/model-user/UserModel";

export class AESEncryption {

  static generateKey(): string {

    return CryptoJS.lib.WordArray.random(32).toString();
  }

  static encrypt(plaintext: string, key: string): string {
    try {
      if (!plaintext || typeof plaintext !== "string") {
        throw new Error("無効な平文データです");
      }

      const encrypted = CryptoJS.AES.encrypt(plaintext, key);

      return encrypted.toString();
    } catch (error) {
      throw new Error(`暗号化に失敗しました: ${error}`);
    }
  }

  static decrypt(ciphertext: string, key: string): string {
    try {
      if (!ciphertext || typeof ciphertext !== "string") {
        throw new Error("無効な暗号化データです");
      }

      const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, key);

      const result = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!result) {
        throw new Error("復号化に失敗しました - 無効なキーまたはデータ");
      }

      return result;
    } catch (error) {
      throw new Error(`復号化に失敗しました: ${error}`);
    }
  }

  static deriveKeyFromPassword(password: string, salt: string): string {
    try {
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 10000,
      });

      return key.toString();
    } catch (error) {
      throw new Error(`キー導出に失敗しました: ${error}`);
    }
  }

  static hashPassword(password: string): string {
    try {
      if (!password || typeof password !== "string") {
        throw new Error("無効なパスワードです");
      }

      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "Deprecated hashPassword method used. Migrate to PasswordHasher.",
      });

      const salt = CryptoJS.lib.WordArray.random(16).toString();

      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000,
      });

      return `${salt}:${hash.toString()}`;
    } catch (error) {
      throw new Error(`パスワードハッシュ化に失敗しました: ${error}`);
    }
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      if (!password || !hashedPassword) {
        return false;
      }

      SecurityLogger.logEvent({
        type: "encryption_warning",
        details:
          "Deprecated verifyPassword method used. Migrate to PasswordHasher.",
      });

      const [salt, hash] = hashedPassword.split(":");
      if (!salt || !hash) {
        return false;
      }

      const inputHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 100000,
      });

      return safeStringCompare(hash, inputHash.toString());
    } catch (error) {
      return false;
    }
  }
}

class EncryptionKeyManager {

  private static readonly KEY_NAME = "encryption_master_key";

  private static cachedKey: string | null = null;

  static async getOrCreateKey(): Promise<string> {

    if (Platform.OS === "web") {
      throw new Error(
        "Web環境ではクライアントサイド暗号化は使用できません。サーバーサイド暗号化を使用してください。"
      );
    }

    if (this.cachedKey) {
      return this.cachedKey;
    }

    try {

      let key = await SecureStore.getItemAsync(this.KEY_NAME);
      if (!key) {

        key = AESEncryption.generateKey();
        await SecureStore.setItemAsync(this.KEY_NAME, key);
      }
      this.cachedKey = key;
      return key;
    } catch (error) {

      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Key retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      if (!this.cachedKey) {
        this.cachedKey = AESEncryption.generateKey();
      }
      return this.cachedKey;
    }
  }

  static async clearKey(): Promise<void> {
    this.cachedKey = null;
    try {
      if (Platform.OS === "web") {
        throw new Error("Web環境では暗号化キーの操作はできません");
      } else {
        await SecureStore.deleteItemAsync(this.KEY_NAME);
      }
    } catch (error) {

      SecurityLogger.logEvent({
        type: "encryption_warning",
        userId: "system",
        details: `Key clearing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  }
}

export interface EncryptedPersonalInfo {
  realName?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;

  nickname: string;
  email: string;
  birthdayYear?: number;
  role: UserRole;
  storeId: string;
}

export class PersonalInfoEncryption {

  static async encryptPersonalInfo(data: EncryptedPersonalInfo): Promise<any> {

    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    try {

      const key = await EncryptionKeyManager.getOrCreateKey();

      const result: any = {
        nickname: data.nickname,
        email: data.email,
        role: data.role,
        storeId: data.storeId,
        birthdayYear: data.birthdayYear,
        isEncrypted: true,
        encryptedAt: new Date().toISOString(),
      };

      if (data.realName) {
        result.realName = AESEncryption.encrypt(data.realName, key);
      }
      if (data.phoneNumber) {
        result.phoneNumber = AESEncryption.encrypt(data.phoneNumber, key);
      }
      if (data.address) {
        result.address = AESEncryption.encrypt(data.address, key);
      }
      if (data.notes) {
        result.notes = AESEncryption.encrypt(data.notes, key);
      }

      return result;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Personal info encryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      throw new Error("個人情報の暗号化に失敗しました");
    }
  }

  static async decryptPersonalInfo(
    encryptedData: any
  ): Promise<EncryptedPersonalInfo> {
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    try {

      if (!encryptedData.isEncrypted) {
        return encryptedData as EncryptedPersonalInfo;
      }

      const key = await EncryptionKeyManager.getOrCreateKey();
      const result: EncryptedPersonalInfo = {
        nickname: encryptedData.nickname,
        email: encryptedData.email,
        role: encryptedData.role,
        storeId: encryptedData.storeId,
        birthdayYear: encryptedData.birthdayYear,
      };

      if (encryptedData.realName) {
        result.realName = AESEncryption.decrypt(encryptedData.realName, key);
      }
      if (encryptedData.phoneNumber) {
        result.phoneNumber = AESEncryption.decrypt(
          encryptedData.phoneNumber,
          key
        );
      }
      if (encryptedData.address) {
        result.address = AESEncryption.decrypt(encryptedData.address, key);
      }
      if (encryptedData.notes) {
        result.notes = AESEncryption.decrypt(encryptedData.notes, key);
      }

      return result;
    } catch (error) {
      SecurityLogger.logEvent({
        type: "encryption_error",
        userId: "system",
        details: `Personal info decryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
      throw new Error("個人情報の復号化に失敗しました");
    }
  }

  static async secureDelete(): Promise<void> {
    if (Platform.OS === "web") {
      throw new Error("Web環境では暗号化機能は利用できません");
    }
    await EncryptionKeyManager.clearKey();
  }
}

export class PersonalDataDeletion {

  static async deleteUserData(userId: string, storeId: string): Promise<void> {
    try {

      await PersonalInfoEncryption.secureDelete();

      const { getSupabase } = await import("@/services/supabase/supabase-client");
      const supabase = getSupabase();

      await supabase.from("users").delete().eq("uid", userId);

      await supabase
        .from("shifts")
        .delete()
        .eq("user_id", userId)
        .eq("store_id", storeId);

      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: userId,
        details: "User data deletion completed",
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw new Error(`データ削除に失敗しました: ${error}`);
    }
  }

  static async deleteUserDataByAdmin(
    targetUserId: string,
    storeId: string,
    adminUserId: string
  ): Promise<void> {
    try {
      const { getSupabase } = await import("@/services/supabase/supabase-client");
      const supabase = getSupabase();

      await supabase
        .from("users")
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
          real_name: null,
          phone_number: null,
          address: null,
          notes: null,
        })
        .eq("uid", targetUserId);

      await supabase
        .from("shifts")
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: adminUserId,
        })
        .eq("user_id", targetUserId)
        .eq("store_id", storeId);

      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: adminUserId,
        details: `Admin deleted user data: ${targetUserId}`,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw new Error(`管理者によるデータ削除に失敗しました: ${error}`);
    }
  }
}
