import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/providers/AuthProvider";

export default function MainHome() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/login");
    }
  }, [isReady, user]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ようこそ！ホーム画面</Text>
      <Text style={styles.info}>ログイン中：{user.nickname}</Text>
      <Text style={styles.info}>役割：{user.role}</Text>

      <View style={{ marginTop: 24 }}>
        <Button title="ログアウト" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginTop: 8,
  },
});
