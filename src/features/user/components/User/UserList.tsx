import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { User } from "@/features/user/types/user";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { styles } from "./UserList.styles";
import { UserListProps } from "./types";

/**
 * ユーザー一覧表示コンポーネント
 * ユーザーの検索、編集、削除機能を提供
 */
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
