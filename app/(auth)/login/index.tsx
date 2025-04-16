import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/providers/AuthContext";

export default function Login() {
  const { setUserAndRole } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("エラー", "教師IDとパスワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      const email = `${username}@example.com`;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      setUserAndRole(
        userCredential.user,
        userData?.role === "master" ? "master" : "user"
      );

      if (userData?.role === "master") {
        router.replace("/(main)/master/home");
      } else {
        router.replace("/(main)/teacher/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("エラー", "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => router.push("/(main)")}
          >
            <Text style={styles.title}>シフトスケジューラー</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.formWrapper}>
          <View style={styles.formContainer}>
            <Text style={styles.loginTitle}>ログイン</Text>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ニックネーム</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>パスワード</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={styles.rememberMe}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberMeText}>
                  ニックネームを保存する
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "ログイン中..." : "ログイン"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  パスワードを忘れた方はこちら
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.maintenanceText}>
            午前2:00～5:00の間、サーバーメンテナンスのためサービスの利用ができなくなる場合があります。
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#1565C0",
    width: "100%",
  },
  headerContent: {
    width: "100%",
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  formWrapper: {
    flex: 1,
    width: "100%",
    padding: 16,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
  },
  rememberMeText: {
    color: "#666",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#1565C0",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#1565C0",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  maintenanceText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
});
