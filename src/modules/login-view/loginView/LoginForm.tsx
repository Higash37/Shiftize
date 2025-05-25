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
import { loginFormStyles } from "./LoginForm.styles";
import type { LoginFormProps } from "./LoginForm.types";

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWideScreen = width >= 768;

  // フォーカスの状態を管理
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("エラー", "ニックネームとパスワードを入力してください");
      return;
    }
    if (onLogin) {
      await onLogin(username, password, rememberMe);
    }
  };

  return (
    <View
      style={[
        loginFormStyles.formWrapper,
        isWideScreen && loginFormStyles.formWrapperWeb,
      ]}
    >
      <View style={loginFormStyles.formContainer}>
        <Text style={loginFormStyles.loginTitle}>ログイン</Text>
        <View style={loginFormStyles.form}>
          <View style={loginFormStyles.inputGroup}>
            <Text style={loginFormStyles.label}>ニックネーム</Text>
            <TextInput
              style={[
                loginFormStyles.input,
                usernameFocused && { borderColor: "#1565C0", borderWidth: 2 },
              ]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
            />
          </View>
          <View style={loginFormStyles.inputGroup}>
            <Text style={loginFormStyles.label}>パスワード</Text>
            <TextInput
              style={[
                loginFormStyles.input,
                passwordFocused && { borderColor: "#1565C0", borderWidth: 2 },
              ]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>
          <TouchableOpacity
            style={loginFormStyles.rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[
                loginFormStyles.checkbox,
                rememberMe && loginFormStyles.checkboxChecked,
              ]}
            >
              {rememberMe && <Text style={loginFormStyles.checkmark}>✓</Text>}
            </View>
            <Text style={loginFormStyles.rememberMeText}>
              ニックネームを保存する
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              loginFormStyles.loginButton,
              loading && loginFormStyles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.75}
          >
            <Text style={loginFormStyles.loginButtonText}>
              {loading ? "ログイン中..." : "ログイン"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={loginFormStyles.maintenanceText}>
        午前2:00～5:00の間、サーバーメンテナンスのためサービスの利用ができなくなる場合があります。
      </Text>
    </View>
  );
};
