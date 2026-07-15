

import { getSupabase } from "@/services/supabase/supabase-client";

import { AppVersion } from "@/common/common-utils/util-version/AppVersion";

const CURRENT_VERSION = AppVersion.getVersion();

interface AppVersionData {
  version: string;          
  forceUpdate: boolean;     
  updateMessage?: string;   
  updatedAt: string;        
}

export class VersionManager {

  private static readonly VERSION_KEY = 'app_version';

  private static readonly CHECK_INTERVAL_MS = 60_000;

  private static readonly RELOAD_DELAY_MS = 100;

  private static intervalId: NodeJS.Timeout | null = null;

  static async startVersionCheck(onUpdateRequired?: () => void) {

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    await this.checkVersion(onUpdateRequired);

    this.intervalId = setInterval(async () => {
      await this.checkVersion(onUpdateRequired);
    }, this.CHECK_INTERVAL_MS);
  }

  static stopVersionCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);  
      this.intervalId = null;
    }
  }

  private static async fetchVersionData(): Promise<AppVersionData | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("data")                       
      .eq("settings_key", "app_version")   
      .maybeSingle();                       

    if (error || !data) return null;

    return data.data as AppVersionData;
  }

  private static async checkVersion(onUpdateRequired?: () => void) {
    try {

      const versionData = await this.fetchVersionData();

      if (versionData) {

        if (this.isUpdateRequired(CURRENT_VERSION, versionData.version)) {

          if (versionData.forceUpdate) {

            this.forceReload(versionData.updateMessage);
          } else if (onUpdateRequired) {

            onUpdateRequired();
          }
        }
      }
    } catch (error) {

    }
  }

  private static isUpdateRequired(current: string, latest: string): boolean {

    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;  
      const latestPart = latestParts[i] || 0;

      if (latestPart > currentPart) return true;   
      if (latestPart < currentPart) return false;  

    }

    return false;
  }

  private static forceReload(message?: string) {
    if (message) {

      alert(message || '新しいバージョンが利用可能です。アプリを再読み込みします。');
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    setTimeout(() => {

      const timestamp = new Date().getTime();
      const url = new URL(window.location.href);
      url.searchParams.set('v', timestamp.toString());

      window.location.href = url.toString();
    }, this.RELOAD_DELAY_MS);
  }

  static updateLocalVersion(version: string) {

    localStorage.setItem(this.VERSION_KEY, version);
  }

  static getLocalVersion(): string | null {
    return localStorage.getItem(this.VERSION_KEY);
  }

  static async checkForUpdatesOnStartup(): Promise<boolean> {
    try {
      const versionData = await this.fetchVersionData();

      if (versionData) {
        if (this.isUpdateRequired(CURRENT_VERSION, versionData.version)) {
          if (versionData.forceUpdate) {

            this.forceReload(versionData.updateMessage);
            return true;
          } else {

            const userChoice = confirm(
              versionData.updateMessage || '新しいバージョンが利用可能です。今すぐ更新しますか？'
            );

            if (userChoice) {

              this.forceReload();
              return true;
            }

          }
        }
      }

      return false;
    } catch (error) {

      return false;
    }
  }
}

export async function updateAppVersion(
  version: string,
  forceUpdate: boolean = false,
  updateMessage?: string
) {
  const supabase = getSupabase();

  const versionData = {
    version,
    forceUpdate,
    updateMessage,
    updatedAt: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("settings")
    .select("store_id")
    .eq("settings_key", "app_version")
    .maybeSingle();

  if (existing) {

    const { error } = await supabase
      .from("settings")
      .update({ data: versionData })           
      .eq("settings_key", "app_version")
      .eq("store_id", existing.store_id);
    if (error) throw error;
  } else {

    const { error } = await supabase
      .from("settings")
      .insert({
        store_id: "",                         
        settings_key: "app_version",
        data: versionData,
      });
    if (error) throw error;
  }
}
