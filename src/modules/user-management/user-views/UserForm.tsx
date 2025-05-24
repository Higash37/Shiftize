import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Input from "@/common/common-ui/ui-forms/FormInput";
import Button from "@/common/common-ui/ui-forms/FormButton";
import ErrorMessage from "@/common/common-ui/ui-feedback/FeedbackError";
import { checkMasterExists } from "@/services/firebase/firebase";
import { styles } from "./UserForm.styles";
import { UserFormProps } from "../user-types/components";

/**
 * ユーザー情報入力フォームコンポーネント
 * 新規ユーザー追加と既存ユーザー編集の両方に対応
 */
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
    const checkForMasterUser = async () => {
      try {
        const hasMasterUser = await checkMasterExists();
        setHasMaster(hasMasterUser);
      } catch (err) {
        console.error("マスターユーザーチェックエラー:", err);
      }
    };

    if (mode === "add") {
      checkForMasterUser();
    }
  }, [mode]);

  // 初期データが変更された時の更新
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
            variant={role === "master" ? "secondary" : "outline"}
            style={[
              styles.roleButton,
              role === "master" && styles.masterRoleButton,
            ]}
            disabled={hasMaster && role !== "master"}
          />
        </View>
      )}
      {hasMaster && role !== "master" && (
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
            (role === "master" && hasMaster && role !== initialData?.role)
          }
          style={styles.button}
        />
      </View>
    </View>
  );
};
