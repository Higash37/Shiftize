

import type { ISettingsService } from "../interfaces/ISettingsService";
import type { AppSettings } from "@/common/common-utils/util-settings/useAppSettings";
import { getSupabase } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export class SupabaseSettingsAdapter implements ISettingsService {

  async getSettings(): Promise<AppSettings | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("data")
      .eq("settings_key", "shiftApp")
      .maybeSingle();

    if (error || !data) return null;
    return data.data as AppSettings;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("settings")
      .select("data, store_id")
      .eq("settings_key", "shiftApp")
      .maybeSingle();

    if (existing) {
      const mergedData = { ...existing.data, ...settings };
      const { error } = await supabase
        .from("settings")
        .update({ data: mergedData })
        .eq("settings_key", "shiftApp")
        .eq("store_id", existing.store_id);
      if (error) throw error;
    } else {

      const { data: userData } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", (await supabase.auth.getUser()).data.user?.id || "")
        .maybeSingle();

      const storeId = userData?.store_id || "";

      const { error } = await supabase.from("settings").insert({
        store_id: storeId,
        settings_key: "shiftApp",
        data: settings,
      });
      if (error) throw error;
    }
  }

  async resetSettings(defaults: AppSettings): Promise<void> {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("settings")
      .select("store_id")
      .eq("settings_key", "shiftApp")
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("settings")
        .update({ data: defaults })
        .eq("settings_key", "shiftApp")
        .eq("store_id", existing.store_id);
      if (error) throw error;
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", (await supabase.auth.getUser()).data.user?.id || "")
        .single();

      const storeId = userData?.store_id || "";

      const { error } = await supabase.from("settings").insert({
        store_id: storeId,
        settings_key: "shiftApp",
        data: defaults,
      });
      if (error) throw error;
    }
  }

  onSettingsChanged(
    callback: (settings: AppSettings | null) => void
  ): () => void {
    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    this.getSettings().then(callback).catch(() => callback(null));

    channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: "settings_key=eq.shiftApp",
        },
        (payload) => {
          const isValidSettingsPayload =
            payload.new && typeof payload.new === "object" && "data" in payload.new;
          if (isValidSettingsPayload) {
            callback((payload.new as any).data as AppSettings);
          } else {
            callback(null);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }

  onShiftStatusConfigChanged(callback: (configs: Record<string, any> | null) => void): () => void {
    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    (async () => {
      const { data: userData } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", (await supabase.auth.getUser()).data.user?.id || "")
        .maybeSingle();
      const storeId = userData?.store_id || "";

      const { data } = await supabase
        .from("settings")
        .select("data")
        .eq("settings_key", "shiftStatus")
        .eq("store_id", storeId)
        .maybeSingle();
      callback(data?.data || null);

      channel = supabase
        .channel(`settings-shift-status-${storeId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "settings",
            filter: `settings_key=eq.shiftStatus`,
          },
          (payload) => {

            const row = payload.new as any;
            if (row?.store_id === storeId && row?.data) {
              callback(row.data);
            }
          }
        )
        .subscribe();
    })().catch(() => callback(null));

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }
}
