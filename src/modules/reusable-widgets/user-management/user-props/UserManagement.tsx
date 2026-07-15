
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { User, UserRole } from "@/common/common-models/model-user/UserModel";
import { ServiceProvider } from "@/services/ServiceProvider";
import { UserList } from "./UserList";
import { UserForm } from "./UserForm";
import { UserManagementProps } from "../user-types/components";
import { colors, typography } from "@/common/common-constants/ThemeConstants";

const UserManagement: React.FC<UserManagementProps> = ({ userId: _userId }) => {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(
    {}
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersList = await ServiceProvider.users.getUsers();
      setUserList(usersList);
      setError(null);
    } catch (err: any) {
      setError("ユーザーデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (userId: string) => {

    setLoading(true);
    try {

      setUserList(userList.filter((user: User) => user.uid !== userId));
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUser = async (data: {
    email: string;
    password?: string;
    nickname: string;
    role: UserRole;
  }) => {
    setLoading(true);
    try {
      if (selectedUser) {

        const updatedUsers = userList.map((user: User) =>
          user.uid === selectedUser.uid
            ? { ...user, nickname: data.nickname, role: data.role }
            : user
        );
        setUserList(updatedUsers);
      } else {

        const newUserId = `user_${Date.now()}`;

        const newUser: User = {
          uid: newUserId,
          nickname: data.nickname,
          role: data.role,
        };
        setUserList([...userList, newUser]);

        if (data.password) {
          setUserPasswords({
            ...userPasswords,
            [newUserId]: data.password,
          });
        }
      }

      setShowForm(false);
      setSelectedUser(null);
    } catch (err) {
      setError("ユーザーの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>ユーザー管理</Text>
      </View>

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
            selectedUser ? userPasswords[selectedUser.uid] ?? "" : ""
          }
        />
      ) : (
        <UserList
          userList={userList}
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: "700",
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
