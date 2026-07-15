

import type { IUserService, UserEmailLookupResult, UserFullProfile } from "../interfaces/IUserService";
import type { User, UserData } from "@/common/common-models/model-user/UserModel";
import { getSupabase } from "./supabase-client";
import { PersonalDataDeletion } from "@/common/common-utils/security/encryptionUtils";
import { SecurityLogger } from "@/common/common-utils/security/securityUtils";
import { ValidationError, NotFoundError, PermissionError } from "@/common/common-errors/AppErrors";

export class SupabaseUserAdapter implements IUserService {

  async getUsers(
    storeId?: string
  ): Promise<(User & { currentPassword?: string })[]> {
    const supabase = getSupabase();
    let query = supabase.from("users").select("*");

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row) => ({
      uid: row.uid,
      role: row.role || "user",
      nickname: row.nickname || "",
      furigana: row.furigana ?? undefined,
      email: row.email,
      color: row.color,
      storeId: row.store_id || "",
      hourlyWage: row.hourly_wage ?? undefined,
      createdAt: row.created_at,
    }));
  }

  async deleteUser(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("users").delete().eq("uid", id);
    if (error) throw error;
  }

  async getUserData(userId: string): Promise<UserData | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      nickname: data.nickname,
      role: data.role,
      email: data.email,
      createdAt: new Date(data.created_at),
      hourlyWage: data.hourly_wage,
    };
  }

  async checkMasterExists(storeId?: string): Promise<boolean> {
    const supabase = getSupabase();
    let query = supabase
      .from("users")
      .select("uid")
      .eq("role", "master")
      .limit(1);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return (data || []).length > 0;
  }

  async checkEmailExists(email: string, storeId?: string): Promise<boolean> {
    const supabase = getSupabase();
    let query = supabase.from("users").select("uid").eq("email", email);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).length > 0;
  }

  async checkEmailDuplicate(email: string): Promise<void> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("uid")
      .eq("email", email);

    if (error) throw error;

    if (data && data.length > 0) {
      throw new ValidationError("このメールアドレスは既に使用されています");
    }
  }

  async findUserByEmail(email: string): Promise<UserEmailLookupResult | null> {
    const supabase = getSupabase();

    const { data: emailData } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (emailData && emailData.length > 0) {
      const row = emailData[0];

      if (row.original_user_id) {
        const { data: originalData } = await supabase
          .from("users")
          .select("*")
          .eq("uid", row.original_user_id)
          .maybeSingle();

        if (originalData) {
          return {
            id: originalData.uid,
            uid: originalData.uid,
            nickname: originalData.nickname,
            email: originalData.email,
            role: originalData.role,
            storeId: originalData.store_id,
            color: originalData.color,
            hourlyWage: originalData.hourly_wage,
            realEmail: email,
            realEmailUserId: row.uid,
          };
        }
      }

      return {
        id: row.uid,
        uid: row.uid,
        nickname: row.nickname,
        email: row.email,
        role: row.role,
        storeId: row.store_id,
        color: row.color,
        hourlyWage: row.hourly_wage,
      };
    }

    const { data: realEmailData } = await supabase
      .from("users")
      .select("*")
      .eq("real_email", email)
      .limit(1);

    if (realEmailData && realEmailData.length > 0) {
      const row = realEmailData[0];
      return {
        id: row.uid,
        uid: row.uid,
        nickname: row.nickname,
        email: row.email,
        role: row.role,
        storeId: row.store_id,
        color: row.color,
        hourlyWage: row.hourly_wage,
        realEmail: row.real_email,
      };
    }

    return null;
  }

  async addSecondaryEmail(userId: string, realEmail: string): Promise<void> {
    const supabase = getSupabase();

    await this.checkEmailDuplicate(realEmail);

    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userId)
      .maybeSingle();

    if (error || !userData) {
      throw new NotFoundError("ユーザーが見つかりません");
    }

    if (userData.real_email) {
      throw new ValidationError("実際のメールアドレスは既に設定されています");
    }

    await supabase
      .from("users")
      .update({
        real_email: realEmail,
      })
      .eq("uid", userId);
  }

  async secureDeleteUser(userId: string, storeId: string): Promise<void> {
    try {
      await PersonalDataDeletion.deleteUserData(userId, storeId);

      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: userId,
        details: "User requested data deletion (GDPR)",
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: userId,
        details: `Data deletion failed: ${error}`,
        userAgent: navigator.userAgent,
      });
      throw error;
    }
  }

  async secureDeleteUserByAdmin(
    targetUserId: string,
    storeId: string,
    adminUserId: string
  ): Promise<void> {
    try {
      const adminUser = await this.getUserData(adminUserId);
      if (!adminUser || adminUser.role !== "master") {
        throw new PermissionError("管理者権限が必要です");
      }

      const supabase = getSupabase();
      const { data: adminProfile } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", adminUserId)
        .maybeSingle();
      const { data: targetProfile } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", targetUserId)
        .maybeSingle();

      if (!adminProfile || !targetProfile) {
        throw new NotFoundError("ユーザー情報が見つかりません");
      }
      if (adminProfile.store_id !== targetProfile.store_id) {
        throw new PermissionError("異なる店舗のユーザーを削除する権限がありません");
      }

      await PersonalDataDeletion.deleteUserDataByAdmin(
        targetUserId,
        storeId,
        adminUserId
      );

      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: adminUserId,
        details: `Admin deleted user: ${targetUserId}`,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      SecurityLogger.logEvent({
        type: "unauthorized_access",
        userId: adminUserId,
        details: `Admin deletion failed: ${error}`,
        userAgent: navigator.userAgent,
      });
      throw error;
    }
  }

  async getUserFullProfile(userId: string): Promise<UserFullProfile | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("uid,nickname,role,email,store_id,color,hourly_wage")
      .eq("uid", userId)
      .maybeSingle();

    if (error) return null;
    if (!data) return null;

    return {
      ...data,
      storeId: data.store_id,
    };
  }
}
