import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { User } from "../../services/firebase";
import { colors, layout, typography } from "../../constants/theme";
import Button from "../Common/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onAdd: () => void;
  loading?: boolean;
  userPasswords?: Record<string, string>;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
  userPasswords = {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers =
    users?.filter((user) => {
      if (!user) return false;
      const query = searchQuery.toLowerCase();
      return (
        (user.nickname?.toLowerCase() ?? "").includes(query) ||
        user.uid.toLowerCase().includes(query)
      );
    }) ?? [];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color={colors.primary}
          />
        </View>
      </View>
      <View style={styles.middleSection}>
        <Text style={styles.userName}>{user.nickname || "名前なし"}</Text>
        <Text style={styles.userRole}>
          {user.role === "master" ? "マスター" : "一般ユーザー"}
        </Text>
      </View>
      <View style={styles.rightSection}>
        {userPasswords[user.uid] && (
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordLabel}>パスワード</Text>
            <Text style={styles.passwordValue}>{userPasswords[user.uid]}</Text>
          </View>
        )}
        <View style={styles.actions}>
          <Button
            title="編集"
            onPress={() => onEdit(user)}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="削除"
            onPress={() => onDelete(user.uid)}
            variant="outline"
            size="small"
            style={{
              minWidth: 80,
              borderColor: colors.error,
            }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="ユーザーを検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button
          title="ユーザーを追加"
          onPress={onAdd}
          variant="primary"
          size="medium"
        />
      </View>
      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(user) => user.uid}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery
              ? "検索結果が見つかりません"
              : "ユーザーが登録されていません"}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  list: {
    gap: 12,
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  leftSection: {
    justifyContent: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  middleSection: {
    flex: 1,
    gap: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  userRole: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  passwordContainer: {
    alignItems: "flex-end",
  },
  passwordLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  passwordValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text.secondary,
    marginTop: 24,
    fontSize: typography.fontSize.medium,
  },
});
