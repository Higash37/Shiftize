

import { ServiceProvider } from "./ServiceProvider";

import { SupabaseAuthAdapter } from "./supabase/SupabaseAuthAdapter";
import { SupabaseUserAdapter } from "./supabase/SupabaseUserAdapter";
import { SupabaseShiftAdapter } from "./supabase/SupabaseShiftAdapter";
import { SupabaseStoreAdapter } from "./supabase/SupabaseStoreAdapter";
import { SupabaseSettingsAdapter } from "./supabase/SupabaseSettingsAdapter";
import { SupabaseAuditAdapter } from "./supabase/SupabaseAuditAdapter";
import { SupabaseShiftConfirmationAdapter } from "./supabase/SupabaseShiftConfirmationAdapter";
import { SupabaseTeacherStatusAdapter } from "./supabase/SupabaseTeacherStatusAdapter";
import { SupabaseShiftSubmissionAdapter } from "./supabase/SupabaseShiftSubmissionAdapter";
import { loadJapaneseHolidays } from "@/common/common-utils/util-settings/japaneseHolidays";

let initialized = false;

export function initializeServices(): void {

  if (initialized) return;

  ServiceProvider.setAuthService(new SupabaseAuthAdapter());
  ServiceProvider.setUserService(new SupabaseUserAdapter());
  ServiceProvider.setShiftService(new SupabaseShiftAdapter());
  ServiceProvider.setStoreService(new SupabaseStoreAdapter());
  ServiceProvider.setSettingsService(new SupabaseSettingsAdapter());
  ServiceProvider.setAuditService(new SupabaseAuditAdapter());
  ServiceProvider.setShiftConfirmationService(new SupabaseShiftConfirmationAdapter());
  ServiceProvider.setTeacherStatusService(new SupabaseTeacherStatusAdapter());
  ServiceProvider.setShiftSubmissionService(new SupabaseShiftSubmissionAdapter());

  loadJapaneseHolidays();

  initialized = true;
}
