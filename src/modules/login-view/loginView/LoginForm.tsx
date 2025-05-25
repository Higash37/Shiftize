import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { loginFormStyles as styles } from "./LoginForm.styles";
import type { LoginFormProps } from "./LoginForm.types";

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("エラー", "教師IDとパスワードを入力してください");
      return;
    }
    if (onLogin) {
      await onLogin(username, password, rememberMe);
    }
  };

  return (
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
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>ニックネームを保存する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
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
  );
};
