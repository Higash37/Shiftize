import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type ShiftAppSettings = {
  darkMode: boolean;
};

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

  const saveSettings = async (newSettings: ShiftAppSettings) => {
    setLoading(true);
    const ref = doc(db, "settings", "shiftApp");
    await setDoc(ref, newSettings, { merge: true });
    setSettings(newSettings);
    setLoading(false);
    Alert.alert("保存しました");
  };

  if (loading)
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "外観設定", headerShown: true }} />
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>外観</Text>
        <View style={styles.listItem}>
          <Text style={styles.listText}>ダークモード</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={(v) => setSettings((s) => ({ ...s, darkMode: v }))}
          />
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => saveSettings(settings)}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
  card: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  listText: { fontSize: 16, color: "#222" },
  saveButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    alignSelf: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
