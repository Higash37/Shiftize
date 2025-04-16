import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useRouter } from "expo-router";
import bcrypt from "bcrypt";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // ここで既存のパスワードを取得するロジックを追加
    setCurrentPassword("examplePassword"); // 例として固定値を使用
  }, []);

  const handleChangePassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setMessage("パスワードが更新されました");
        router.replace("/(main)/master/users"); // ユーザー管理画面に戻る
      } catch (error: any) {
        if (error.code === "auth/invalid-credential") {
          setMessage("現在のパスワードが正しくありません");
        } else {
          setMessage("エラーが発生しました: " + error.message);
        }
      }
    }
  };

  const hashPassword = async (password: string) => {
    const response = await fetch("http://localhost:3000/hash-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    return data.hashedPassword;
  };

  return (
    <View style={styles.container}>
      <Text>既存のパスワード: {currentPassword}</Text>
      <Text>新しいパスワード</Text>
      <TextInput
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="新しいパスワードを入力"
        style={styles.input}
      />
      <Button title="パスワードを変更" onPress={handleChangePassword} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default ChangePassword;
