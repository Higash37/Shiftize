import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

const LoginScreen = () => {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    //仮認証処理 (本番は Firebase に置き換える)
    if (nickname === "master" && password === "1234") {
      Alert.alert("ログイン成功", `ようこそ${nickname}さん`);
    } else {
      Alert.alert("ログイン失敗", "ニックネームまたはパスワードが違います。");
    }
  };

  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>ログイン</Text>
      <TextInput
        style={Styles.input}
        placeholder="ニックネーム"
        value={nickname}
        onChangeText={setNickname}
      />
      <TextInput
        style={Styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="ログイン" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
});
