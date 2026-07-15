

import React, { createContext, useContext, ReactNode } from "react";
import { useAppSettings, AppSettings } from "./useAppSettings";

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;

  error: string | null;

  loadSettings: () => Promise<void>;

  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;

  updateShiftRuleSettings: (
    settings: Partial<AppSettings["shiftRule"]>
  ) => Promise<void>;
  updateAppearanceSettings: (
    settings: Partial<AppSettings["appearance"]>
  ) => Promise<void>;
  updateHolidaySettings: (
    settings: Partial<AppSettings["holidays"]>
  ) => Promise<void>;

  addHoliday: (
    holiday: Omit<AppSettings["holidays"]["holidays"][0], "id">
  ) => Promise<void>;
  removeHoliday: (holidayId: string) => Promise<void>;
  addSpecialDay: (
    specialDay: Omit<AppSettings["holidays"]["specialDays"][0], "id">
  ) => Promise<void>;
  removeSpecialDay: (specialDayId: string) => Promise<void>;

  isHoliday: (date: string) => boolean;
  isSpecialDay: (date: string) => boolean;
  getHolidayInfo: (date: string) => {
    isHoliday: boolean;
    isSpecialDay: boolean;
    holidayName: string | undefined;
    specialDayName: string | undefined;
    isWorkingDay: boolean | undefined;
  };

  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {

  const settingsHook = useAppSettings();

  return (
    <SettingsContext.Provider value={settingsHook}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
