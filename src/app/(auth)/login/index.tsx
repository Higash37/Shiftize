import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/services/auth/useAuth";
import { LoginForm } from "@/modules/login-view/loginView/LoginForm";

export default function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const handleLogin = async (
    username: string,
    password: string,
    rememberMe: boolean
  ) => {
    setLoading(true);
    try {
      const email = `${username}@example.com`;
      await signIn(email, password);
      // rememberMeの処理は必要に応じて追加
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("エラー", "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ backgroundColor: "#1565C0", width: "100%" }}>
        <View style={{ width: "100%", padding: 16 }}>
          <TouchableOpacity
            style={{ alignItems: "center", justifyContent: "center" }}
            onPress={() => router.push("/(main)")}
          >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
              シフトスケジューラー
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <LoginForm onLogin={handleLogin} loading={loading} />
    </View>
  );
}
