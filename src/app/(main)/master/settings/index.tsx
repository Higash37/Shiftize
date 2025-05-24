import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";

export default function MasterSettingsIndex() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "設定", headerShown: true }} />
      <Text style={styles.title}>設定</Text>
      <View style={styles.listContainer}>
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => router.push("/master/settings/shift-rule")}
        >
          <Text style={styles.listText}>シフトルール</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => router.push("/master/settings/shift-holiday")}
        >
          <Text style={styles.listText}>祝日・特別日</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => router.push("/master/settings/shift-appearance")}
        >
          <Text style={styles.listText}>外観</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => router.push("/master/settings/shift-status")}
        >
          <Text style={styles.listText}>シフトステータス</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 32,
    alignSelf: "center",
    color: "#222",
    letterSpacing: 0.5,
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignSelf: "center",
    width: "70%",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  listText: {
    fontSize: 18,
    color: "#222",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginLeft: 20,
  },
});
