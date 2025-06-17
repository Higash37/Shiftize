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
import { MaterialIcons } from "@expo/vector-icons";
import { loginFormStyles } from "./LoginForm.styles";
import type { LoginFormProps } from "./LoginForm.types";
import { YoutubeSkeleton } from "@/common/common-ui/ui-loading/SkeletonLoader";
import { useAutoReloadOnLayoutBug } from "@/common/common-ui/ui-loading/useAutoReloadOnLayoutBug";

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  useAutoReloadOnLayoutBug();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWideScreen = width >= 768;

  // フォーカスの状態を管理
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("ニックネームとパスワードを入力してください");
      return;
    }
    if (onLogin) {
      try {
        await onLogin(username, password, rememberMe);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage("ログインに失敗しました。再度お試しください。");
      }
    }
  };

  const inputStyle = (focused: boolean) => [
    loginFormStyles.input,
    focused && { borderColor: "#1565C0", borderWidth: 2 },
    errorMessage ? { borderColor: "red", borderWidth: 2 } : {},
  ];

  if (loading) {
    return <YoutubeSkeleton />;
  }

  return (
    <View
      style={[
        loginFormStyles.formWrapper,
        isWideScreen && loginFormStyles.formWrapperWeb,
      ]}
    >
      {errorMessage ? (
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
          {errorMessage}
        </Text>
      ) : null}
      <View style={loginFormStyles.formContainer}>
        <Text style={loginFormStyles.loginTitle}>ログイン</Text>
        <View style={loginFormStyles.form}>
          <View style={loginFormStyles.inputGroup}>
            <MaterialIcons
              name="person-outline"
              size={24}
              color="#1565C0"
              style={{ marginRight: 8 }}
            />
            <Text style={loginFormStyles.label}>ニックネーム</Text>
            <TextInput
              style={inputStyle(usernameFocused)}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
            />
          </View>
          <View style={loginFormStyles.inputGroup}>
            <MaterialIcons
              name="lock"
              size={24}
              color="#1565C0"
              style={{ marginRight: 8 }}
            />
            <Text style={loginFormStyles.label}>パスワード</Text>
            <TextInput
              style={inputStyle(passwordFocused)}
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
    </View>
  );
};
