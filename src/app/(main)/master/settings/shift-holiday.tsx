import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShiftHolidaySettingsView } from "@/modules/master-view/settings/shiftHolidaySettingView/ShiftHolidaySettingsView";
import type { ShiftHolidaySettings } from "@/modules/master-view/settings/shiftHolidaySettingView/ShiftHolidaySettingsView.types";

const DEFAULT_SETTINGS: ShiftHolidaySettings = {
  holidays: [],
  specialDays: [],
};

export default function ShiftHolidaySettingsScreen() {
  const [settings, setSettings] =
    useState<ShiftHolidaySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "settings", "shiftApp");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    const ref = doc(db, "settings", "shiftApp");
    await setDoc(ref, settings, { merge: true });
    setLoading(false);
    Alert.alert("保存しました");
  };

  return (
    <ShiftHolidaySettingsView
      settings={settings}
      loading={loading}
      calendarMonth={calendarMonth}
      selectedDate={selectedDate}
      showDayModal={showDayModal}
      setSettings={setSettings}
      setCalendarMonth={setCalendarMonth}
      setSelectedDate={setSelectedDate}
      setShowDayModal={setShowDayModal}
      saveSettings={saveSettings}
    />
  );
}
