import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShiftRuleSettingsView } from "@/modules/master-view/settings/ShiftRuleSettingsView";
import type { ShiftRuleSettings } from "@/modules/master-view/settings/ShiftRuleSettingsView.types";

const DEFAULT_SETTINGS: ShiftRuleSettings = {
  maxWorkHours: 8,
  minBreakMinutes: 60,
  maxConsecutiveDays: 5,
};

export default function ShiftRuleSettingsScreen() {
  const [settings, setSettings] = useState<ShiftRuleSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<
    null | "maxWorkHours" | "minBreakMinutes" | "maxConsecutiveDays"
  >(null);

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
    <ShiftRuleSettingsView
      settings={settings}
      loading={loading}
      onChange={setSettings}
      onSave={saveSettings}
      picker={picker}
      setPicker={setPicker}
    />
  );
}
