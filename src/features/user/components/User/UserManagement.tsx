import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/core/firebase/firebase";
import { User } from "@/features/user/types/user";
import { UserList } from "./UserList";
import { UserForm } from "./UserForm";
import { UserManagementProps } from "./types";
import { colors, typography } from "@/common/common-constants/ThemeConstants";

/**
 * ユーザー管理コンポーネント
 * ユーザー一覧の表示、追加、編集、削除などの管理機能を提供します
 */
const UserManagement: React.FC<UserManagementProps> = ({ userId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(
    {}
  );

  // ユーザーデータを取得する
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: User[] = [];
      usersSnapshot.forEach((doc) => {
        usersList.push({ uid: doc.id, ...doc.data() } as User);
      });
      setUsers(usersList);
      setError(null);
    } catch (err: any) {
      console.error("ユーザー取得エラー:", err);
      setError("ユーザーデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ユーザーを編集する
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  // ユーザーを削除する
  const handleDeleteUser = async (userId: string) => {
    // 削除処理は実際には実装しないでダミー実装とする
    setLoading(true);
    try {
      // 実際にFirebaseからユーザーを削除する処理が入る
      console.log(`ユーザー削除: ${userId}`);

      // 削除後に一覧を更新
      setUsers(users.filter((user) => user.uid !== userId));
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // ユーザーの追加/更新
  const handleSubmitUser = async (data: {
    email: string;
    password?: string;
    nickname: string;
    role: "master" | "user";
  }) => {
    setLoading(true);
    try {
      if (selectedUser) {
        // 既存ユーザーの更新処理（実際には実装しない）
        console.log("ユーザー更新:", { ...data, uid: selectedUser.uid });

        // ユーザー一覧を更新
        const updatedUsers = users.map((user) =>
          user.uid === selectedUser.uid
            ? { ...user, nickname: data.nickname, role: data.role }
            : user
        );
        setUsers(updatedUsers);
      } else {
        // 新規ユーザーの追加処理（実際には実装しない）
        const newUserId = `user_${Date.now()}`;
        console.log("ユーザー追加:", { ...data, uid: newUserId });

        // 追加したユーザーを一覧に追加
        const newUser: User = {
          uid: newUserId,
          nickname: data.nickname,
          role: data.role,
        };
        setUsers([...users, newUser]);

        // 仮パスワードを保存
        if (data.password) {
          setUserPasswords({
            ...userPasswords,
            [newUserId]: data.password,
          });
        }
      }

      // フォームを閉じる
      setShowForm(false);
      setSelectedUser(null);
    } catch (err) {
      setError("ユーザーの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // フォームのキャンセル処理
  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ユーザー管理</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showForm ? (
        <UserForm
          onSubmit={handleSubmitUser}
          onCancel={handleCancelForm}
          initialData={selectedUser}
          mode={selectedUser ? "edit" : "add"}
          loading={loading}
          error={error}
          currentPassword={
            selectedUser ? userPasswords[selectedUser.uid] : undefined
          }
        />
      ) : (
        <UserList
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onAdd={() => setShowForm(true)}
          loading={loading}
          userPasswords={userPasswords}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: "700",
    marginBottom: 24,
    color: colors.text.primary,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.error + "15",
    borderRadius: 8,
  },
});

export default UserManagement;
