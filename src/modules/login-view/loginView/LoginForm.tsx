import React, { useState, useEffect } from "react";
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
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading }) => {
  useAutoReloadOnLayoutBug();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [saveStoreId, setSaveStoreId] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [storeIdAndUsername, setStoreIdAndUsername] = useState(""); // 店舗ID+ニックネーム
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWideScreen = width >= 768;

  // フォーカスの状態を管理
  const [storeIdAndUsernameFocused, setStoreIdAndUsernameFocused] =
    useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // コンポーネントマウント時に保存された店舗IDを読み込み
  useEffect(() => {
    const loadSavedStoreId = async () => {
      try {
        const savedStoreId = await StoreIdStorage.getStoreId();
        if (savedStoreId) {
          setStoreIdAndUsername(savedStoreId); // 保存された店舗IDを初期値に設定
          setSaveStoreId(true);
          console.log("保存された店舗IDを読み込みました:", savedStoreId);
        }
      } catch (error) {
        console.error("保存された店舗IDの読み込みに失敗しました:", error);
      }
    };

    loadSavedStoreId();
  }, []);

  // 入力文字列から店舗IDとニックネームを分離
  const parseStoreIdAndUsername = (input: string) => {
    if (input.length < 4) {
      return { storeId: input, username: "" };
    }
    const storeId = input.substring(0, 4);
    const username = input.substring(4);
    return { storeId, username };
  };

  const handleLogin = async () => {
    const { storeId, username } = parseStoreIdAndUsername(storeIdAndUsername);

    if (!username || !password || !storeId) {
      setErrorMessage(
        "店舗ID（4桁）+ ニックネーム・パスワードを入力してください"
      );
      return;
    }

    // storeIdの形式チェック（4桁の数字）
    if (!/^\d{4}$/.test(storeId)) {
      setErrorMessage("店舗IDは4桁の数字で入力してください");
      return;
    }

    if (onLogin) {
      try {
        console.log("ログインフォームから送信:", {
          username,
          storeId,
          saveStoreId,
        });
        await onLogin(username, password, storeId);

        // 店舗ID保存の設定に応じて処理
        if (saveStoreId) {
          await StoreIdStorage.saveStoreId(storeId);
        } else {
          await StoreIdStorage.clearStoreId();
        }

        setErrorMessage("");
      } catch (error) {
        console.error("ログインフォームエラー:", error);
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
              name="store"
              size={24}
              color="#1565C0"
              style={{ marginRight: 8 }}
            />
            <Text style={loginFormStyles.label}>店舗ID + ニックネーム</Text>
            <TextInput
              style={inputStyle(storeIdAndUsernameFocused)}
              value={storeIdAndUsername}
              onChangeText={setStoreIdAndUsername}
              autoCapitalize="none"
              onFocus={() => setStoreIdAndUsernameFocused(true)}
              onBlur={() => setStoreIdAndUsernameFocused(false)}
              placeholder="例: 1234山田太郎"
              keyboardType="default"
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
            onPress={() => setSaveStoreId(!saveStoreId)}
          >
            <View
              style={[
                loginFormStyles.checkbox,
                saveStoreId && loginFormStyles.checkboxChecked,
              ]}
            >
              {saveStoreId && <Text style={loginFormStyles.checkmark}>✓</Text>}
            </View>
            <Text style={loginFormStyles.rememberMeText}>店舗IDを保存する</Text>
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
      <Text style={{ textAlign: "center", marginTop: 1, color: "#555" }}>
        管理者はPCでログインしてください。
      </Text>
      <Text style={{ textAlign: "center", marginTop: 1, color: "#555" }}>
        ipad版は現在対応中です。ログインは出来ますが使いづらいです。
      </Text>
      <Text style={{ textAlign: "center", marginTop: 1, color: "#555" }}>
        パスワード変更の際は管理者（教室長）までお問い合わせください。
      </Text>
      <Text
        style={{
          textAlign: "center",
          marginTop: 8,
          color: "#666",
          fontSize: 12,
        }}
      >
        入力例: 1234山田太郎（店舗ID4桁 + ニックネーム）
      </Text>
    </View>
  );
};
