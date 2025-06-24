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
  const [errorMessage, setErrorMessage] = useState("");
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const handleLogin = async (
    username: string,
    password: string,
    storeId: string
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      console.log("ログイン試行:", { username, storeId });
      const email = `${username}@example.com`;
      await signIn(email, password, storeId);
      console.log("ログイン成功");
    } catch (error: any) {
      console.error("Login error:", error);

      // エラーメッセージを詳細化
      let errorMsg = "ログインに失敗しました。";
      if (error.message) {
        if (error.message.includes("店舗IDが一致しません")) {
          errorMsg = "店舗IDが正しくありません。";
        } else if (error.message.includes("ユーザーが存在しません")) {
          errorMsg = "ユーザーが見つかりません。";
        } else if (error.message.includes("Firebase")) {
          errorMsg = "ニックネームまたはパスワードが正しくありません。";
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
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
              Shiftize
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <LoginForm onLogin={handleLogin} loading={loading} />
      {errorMessage ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 1 }}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
