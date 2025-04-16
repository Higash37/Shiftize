import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Input from "../Common/Input";
import Button from "../Common/Button";
import ErrorMessage from "../Common/ErrorMessage";
import { colors, layout, typography } from "../../constants/theme";
import { User } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

interface UserFormProps {
  onSubmit: (data: {
    email: string;
    password?: string;
    nickname: string;
    role: "master" | "user";
  }) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  loading?: boolean;
  initialData?: User | null;
  mode?: "add" | "edit";
  currentPassword?: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  error,
  loading = false,
  initialData,
  mode = "add",
  currentPassword,
}) => {
  const [email, setEmail] = useState(initialData?.nickname ?? "");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState(initialData?.nickname ?? "");
  const [role, setRole] = useState<"master" | "user">(
    initialData?.role || "user"
  );
  const [errorMessage, setError] = useState<string | null>(null);
  const [hasMaster, setHasMaster] = useState(false);

  const isMasterEdit = mode === "edit" && initialData?.role === "master";

  // マスターユーザーの存在チェック
  useEffect(() => {
    const checkMasterExists = async () => {
      try {
        const usersRef = collection(db, "users");
        const masterQuery = query(usersRef, where("role", "==", "master"));
        const masterSnapshot = await getDocs(masterQuery);
        setHasMaster(!masterSnapshot.empty);
      } catch (err) {
        console.error("マスターユーザーチェックエラー:", err);
      }
    };

    if (mode === "add") {
      checkMasterExists();
    }
  }, [mode]);

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.nickname ?? "");
      setNickname(initialData.nickname ?? "");
      setRole(initialData.role);
      setPassword("");
    }
  }, [initialData]);

  const handleSubmit = async () => {
    // パスワードのバリデーション
    if (mode === "add" || password) {
      if (!password || password.length < 6) {
        setError("パスワードは6文字以上で入力してください");
        return;
      }
    }

    if (!nickname) {
      setError("ニックネームを入力してください");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        email: nickname,
        password: password || undefined,
        nickname,
        role: isMasterEdit ? "master" : role,
      });

      if (mode === "add") {
        setEmail("");
        setPassword("");
        setNickname("");
        setRole("user");
      }
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    }
  };

  return (
    <View style={styles.container}>
      {mode === "edit" && currentPassword && (
        <View style={styles.passwordCard}>
          <Text style={styles.passwordLabel}>現在のパスワード</Text>
          <Text style={styles.passwordValue}>{currentPassword}</Text>
        </View>
      )}
      <Input
        label="ニックネーム"
        value={nickname}
        onChangeText={setNickname}
        placeholder="山田 太郎"
        error={!nickname ? "ニックネームを入力してください" : undefined}
      />
      <Input
        label={
          mode === "edit"
            ? "新しいパスワード（変更する場合のみ）"
            : "パスワード（6文字以上）"
        }
        value={password}
        onChangeText={setPassword}
        placeholder="新しいパスワードを入力"
        secureTextEntry
        error={
          mode === "add" && (!password || password.length < 6)
            ? "パスワードは6文字以上で入力してください"
            : undefined
        }
      />
      {!isMasterEdit && (
        <View style={styles.roleContainer}>
          <Button
            title="一般ユーザー"
            onPress={() => setRole("user")}
            variant={role === "user" ? "primary" : "outline"}
            style={styles.roleButton}
          />
          <Button
            title="マスター"
            onPress={() => setRole("master")}
            variant={role === "master" ? "primary" : "outline"}
            style={styles.roleButton}
            disabled={hasMaster}
          />
        </View>
      )}
      {hasMaster && role === "master" && (
        <Text style={styles.warningText}>マスターユーザーは既に存在します</Text>
      )}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      <View style={styles.buttonContainer}>
        <Button title="キャンセル" onPress={onCancel} variant="outline" />
        <Button
          title={mode === "edit" ? "更新" : "追加"}
          onPress={handleSubmit}
          loading={loading}
          disabled={
            !nickname ||
            (!password && mode === "add") ||
            (role === "master" && hasMaster)
          }
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleButton: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  passwordCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  passwordLabel: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  passwordValue: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
  },
  warningText: {
    color: colors.error,
    fontSize: typography.fontSize.small,
    textAlign: "center",
  },
});
