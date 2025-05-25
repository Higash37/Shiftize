import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShiftAppearanceSettingsView } from "@/modules/master-view/settings/ShiftAppearanceSettingsView";
import type { ShiftAppSettings } from "@/modules/master-view/settings/ShiftAppearanceSettingsView.types";

const DEFAULT_SETTINGS: ShiftAppSettings = {
  darkMode: false,
};

export default function ShiftAppearanceSettingsScreen() {
  const [settings, setSettings] = useState<ShiftAppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
    <ShiftAppearanceSettingsView
      settings={settings}
      loading={loading}
      onChange={setSettings}
      onSave={saveSettings}
    />
  );
}
