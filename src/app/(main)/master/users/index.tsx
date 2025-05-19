import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useUser } from "@/features/user/hooks/useUser";
import { UserForm } from "@/features/user/components/User/UserForm";
import { UserList } from "@/features/user/components/User/UserList";
import { User } from "@/features/user/types/user";
import { colors } from "@/common/common-constants/ThemeConstants";
import UserManagement from "@/features/user/components/User/UserManagement";
import { Header, MasterHeader } from "@/common/common-ui/ui-layout";
import { db } from "@/services/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

interface UserFormData {
  email: string;
  password?: string;
  nickname: string;
  role: "master" | "user";
}

interface UserWithPassword extends User {
  currentPassword?: string;
}

export default function UsersScreen() {
  const { users, loading, error, addUser, editUser, removeUser, setUsers } =
    useUser();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(
    null
  );
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(
    {}
  );

  const handleAddUser = async (data: UserFormData) => {
    if (!data.password) {
      console.error("パスワードは必須です");
      return;
    }

    try {
      setIsAddingUser(true);
      const newUser = await addUser(
        data.email,
        data.password,
        data.nickname,
        data.role
      );

      if (newUser) {
        // パスワード情報をローカルに保存（必要に応じて）
        setUserPasswords((prev) => ({
          ...prev,
          [newUser.uid]: data.password!,
        }));
        // 追加後、フォームを閉じて一覧表示に戻る
        setIsAddingUser(false);
      }
    } catch (err) {
      console.error("ユーザー追加エラー:", err);
      // エラーメッセージの表示などはuseUserフック内で処理される
    } finally {
      // ローディング状態の解除はuseUserフック内で処理されるため、ここでは不要
      // setIsAddingUser(false); // ここでは解除しない
    }
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;

    try {
      const updatedUser = await editUser(selectedUser, {
        nickname: data.nickname,
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
      });

      // パスワードが更新された場合、新しいパスワードを保存
      if (data.password && updatedUser) {
        const newPasswords = { ...userPasswords };
        delete newPasswords[selectedUser.uid];
        newPasswords[updatedUser.uid] = data.password;
        setUserPasswords(newPasswords);
      }

      setSelectedUser(null);
    } catch (err) {
      console.error("ユーザー編集エラー:", err);
    }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      // Firestoreで削除フラグを設定
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { deleted: true }, { merge: true });

      // ユーザー一覧を更新してUIから削除
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== userId));

      // パスワード情報も削除
      const newPasswords = { ...userPasswords };
      delete newPasswords[userId];
      setUserPasswords(newPasswords);
    } catch (err) {
      console.error("ユーザー削除エラー:", err);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser({
      ...user,
      currentPassword: userPasswords[user.uid],
    });
    setIsAddingUser(false);
  };

  const handleStartAddUser = () => {
    setIsAddingUser(true);
    setSelectedUser(null);
  };

  const handleCancel = () => {
    setIsAddingUser(false);
    setSelectedUser(null);
  };

  return (
    <View style={styles.container}>
      <MasterHeader title="ユーザー管理" />
      {selectedUser || isAddingUser ? (
        <View style={styles.formContainer}>
          <UserForm
            onSubmit={selectedUser ? handleEditUser : handleAddUser}
            onCancel={handleCancel}
            initialData={selectedUser}
            currentPassword={selectedUser?.currentPassword}
            error={error}
            loading={loading}
            mode={selectedUser ? "edit" : "add"}
          />
        </View>
      ) : (
        <UserList
          users={users}
          loading={loading}
          onEdit={handleSelectUser}
          onDelete={handleDeleteUser}
          onAdd={handleStartAddUser}
          userPasswords={userPasswords}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  formContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
