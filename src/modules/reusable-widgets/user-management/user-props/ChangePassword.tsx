
import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import Input from "@/common/common-ui/ui-forms/FormInput";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { ServiceProvider } from "@/services/ServiceProvider";
import { createChangePasswordStyles } from "./ChangePassword.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { ChangePasswordProps } from "../user-types/components";

const ChangePassword: React.FC<ChangePasswordProps> = ({
  userId: _userId,
  onComplete,
}) => {
  const styles = useThemedStyles(createChangePasswordStyles);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    if (!currentPassword) {
      setMessage("現在のパスワードを入力してください");
      return false;
    }
    if (!newPassword) {
      setMessage("新しいパスワードを入力してください");
      return false;
    }
    if (newPassword.length < 6) {
      setMessage("パスワードは6文字以上で入力してください");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage("新しいパスワードと確認用パスワードが一致しません");
      return false;
    }
    return true;
  };
  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    try {

      await ServiceProvider.auth.changePassword(currentPassword, newPassword);

      setMessage("パスワードが正常に更新されました");
      setIsSuccess(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (error: any) {
      setIsSuccess(false);

      setMessage(error.message || "パスワード変更中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onComplete}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onComplete}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={() => {}}
        >
          <Text style={styles.title}>パスワード変更</Text>

          <Input
            label="現在のパスワード"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="現在のパスワードを入力"
            secureTextEntry
          />

          <Input
            label="新しいパスワード"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="新しいパスワードを入力（6文字以上）"
            secureTextEntry
          />

          <Input
            label="新しいパスワード（確認）"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="新しいパスワードを再入力"
            secureTextEntry
          />

          {message ? (
            <Text
              style={[
                styles.message,
                isSuccess ? styles.successMessage : styles.errorMessage,
              ]}
            >
              {message}
            </Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              title="パスワードを変更"
              onPress={handleChangePassword}
              loading={isLoading}
              disabled={isLoading}
            />
            <Button
              title="キャンセル"
              onPress={onComplete || (() => {})}
              disabled={isLoading}
              style={{ marginTop: 8 }}
              variant="secondary"
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ChangePassword;
