import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import { Footer } from "@/common/common-ui/ui-layout";
import { useAuth } from "@/services/auth/useAuth";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase/firebase";
import { User } from "@/features/user/types/user";

export default function Settings() {
  const { user, role } = useAuth();

  const handleLogout = async () => {
    Alert.alert("確認", "ログアウトしてもよろしいですか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("エラー", "ログアウトに失敗しました");
          }
        },
      },
    ]);
  };

  const menuItems = [
    ...(role === "master"
      ? [
          {
            label: "ユーザー管理",
            onPress: () => router.push("./users"),
            icon: "👥",
          },
        ]
      : []),
    {
      label: "ログアウト",
      onPress: handleLogout,
      icon: "🚪",
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="設定" />

      <View style={styles.content}>
        {/* デバッグ情報 */}
        <View style={styles.debugInfo}>
          <Text>UID: {user?.uid}</Text>
          <Text>Role: {user?.role}</Text>
          <Text>Nickname: {user?.nickname}</Text>
        </View>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  debugInfo: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    marginBottom: 16,
    borderRadius: 8,
  },
});
