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
    rememberMe: boolean
  ) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const email = `${username}@example.com`;
      await signIn(email, password);
      // rememberMeの処理は必要に応じて追加
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("ニックネームまたはパスワードが違います");
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
