import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import { Footer } from "@/common/common-ui/ui-layout";
import { useAuth } from "@/services/auth/useAuth";
import { router } from "expo-router";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  updatePassword,
  getAuth,
} from "firebase/auth";
import { db, auth } from "@/services/firebase/firebase";
import { User } from "@/common/common-models/ModelIndex";

type UserManagement = {
  uid: string;
  nickname: string;
  role: string;
};

export default function UsersManagement() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    nickname: "",
    password: "",
    role: "user",
  });
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // マスター権限チェック
  useEffect(() => {
    if (role !== "master") {
      Alert.alert("権限エラー", "この画面にはアクセスできません");
      router.back();
    }
  }, [role]);

  // ユーザー一覧を取得
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserManagement[];
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("エラー", "ユーザー情報の取得に失敗しました");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.nickname || !newUser.password) {
      Alert.alert("エラー", "ニックネームとパスワードを入力してください");
      return;
    }

    try {
      // Firebase Authenticationでユーザーを作成
      const email = `${newUser.nickname}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        newUser.password
      );

      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, "users", userCredential.user.uid), {
        nickname: newUser.nickname,
        role: newUser.role,
        createdAt: new Date(),
      });

      Alert.alert("成功", "ユーザーを追加しました");
      setNewUser({ nickname: "", password: "", role: "user" });
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      Alert.alert("エラー", "ユーザーの追加に失敗しました");
    }
  };

  const handleDeleteUser = async (userToDelete: UserManagement) => {
    if (userToDelete.role === "master") {
      const masterUsers = users.filter((u) => u.role === "master");
      if (masterUsers.length <= 1) {
        Alert.alert("エラー", "最後のマスター管理者は削除できません");
        return;
      }
    }

    Alert.alert(
      "確認",
      `${userToDelete.nickname}を削除してもよろしいですか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              // Firestoreからユーザーを削除
              await deleteDoc(doc(db, "users", userToDelete.uid));

              // Firebase Authenticationからユーザーを削除
              const adminAuth = getAuth();
              const userToDeleteAuth = await signInWithEmailAndPassword(
                adminAuth,
                `${userToDelete.nickname}@example.com`,
                "temporary_password" // 注: これは理想的ではありません
              );
              await deleteUser(userToDeleteAuth.user);

              Alert.alert("成功", "ユーザーを削除しました");
              fetchUsers();
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("エラー", "ユーザーの削除に失敗しました");
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) {
      Alert.alert("エラー", "パスワードを入力してください");
      return;
    }

    try {
      // Firebase Authenticationでパスワードを更新
      const userAuth = await signInWithEmailAndPassword(
        auth,
        `${selectedUser.nickname}@example.com`,
        "temporary_password" // 注: これは理想的ではありません
      );
      await updatePassword(userAuth.user, newPassword);

      Alert.alert("成功", "パスワードを変更しました");
      setNewPassword("");
      setShowPasswordForm(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("エラー", "パスワードの変更に失敗しました");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="ユーザー管理" />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ユーザー一覧</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.addButtonText}>＋ 追加</Text>
            </TouchableOpacity>
          </View>

          {showAddForm && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="ニックネーム"
                value={newUser.nickname}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, nickname: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="パスワード"
                value={newUser.password}
                onChangeText={(text) =>
                  setNewUser({ ...newUser, password: text })
                }
                secureTextEntry
              />
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>権限：</Text>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUser.role === "user" && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewUser({ ...newUser, role: "user" })}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      newUser.role === "user" && styles.roleButtonTextActive,
                    ]}
                  >
                    スタッフ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    newUser.role === "master" && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewUser({ ...newUser, role: "master" })}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      newUser.role === "master" && styles.roleButtonTextActive,
                    ]}
                  >
                    マスター
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleAddUser}
                >
                  <Text style={styles.submitButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {users.map((user) => (
            <View key={user.uid} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.nickname}>{user.nickname}</Text>
                <Text style={styles.role}>
                  {user.role === "master" ? "マスター" : "スタッフ"}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.passwordButton}
                  onPress={() => {
                    setSelectedUser(user);
                    setShowPasswordForm(true);
                  }}
                >
                  <Text style={styles.passwordButtonText}>パスワード変更</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(user)}
                >
                  <Text style={styles.deleteButtonText}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* パスワード変更モーダル */}
          {showPasswordForm && selectedUser && (
            <View style={styles.addForm}>
              <Text style={styles.modalTitle}>
                {selectedUser.nickname}のパスワード変更
              </Text>
              <TextInput
                style={styles.input}
                placeholder="新しいパスワード"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowPasswordForm(false);
                    setSelectedUser(null);
                    setNewPassword("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.submitButtonText}>変更</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  addForm: {
    backgroundColor: "#F8F9FB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  roleLabel: {
    marginRight: 8,
    color: "#666",
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  roleButtonText: {
    color: "#666",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: "#F8F9FB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#666",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#4A90E2",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#666",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  passwordButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EBF5FF",
    borderRadius: 6,
  },
  passwordButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
});
