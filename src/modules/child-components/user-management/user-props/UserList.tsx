import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { User } from "@/common/common-models/model-user/UserModel";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { styles } from "./UserList.styles";
import { UserListProps } from "../user-types/components";

/**
 * ユーザー一覧表示コンポーネント
 * ユーザーの検索、編集、削除機能を提供
 */
export const UserList: React.FC<UserListProps> = ({
  userList,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
  userPasswords = {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredUserList =
    userList?.filter((user) => {
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

  const handleDeletePress = (user: User) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.uid);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={0.8}
      onPress={() => onEdit(item)}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-circle"
            size={40}
            color={item.role === "master" ? colors.secondary : colors.primary}
          />
        </View>
      </View>
      <View style={styles.middleSection}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.userName}>{item.nickname || "名前なし"}</Text>
          {/* 名前の右横に色マークを表示。未設定時はグレー */}
          <View
            style={[
              styles.colorMark,
              { backgroundColor: item.color || "#ccc" },
            ]}
          />
        </View>
        <Text style={styles.userRole}>
          {item.role === "master" ? "マスター" : "一般ユーザー"}
        </Text>
        {/* storeIdを表示 */}
        {item.storeId && (
          <Text style={styles.storeId}>店舗ID: {item.storeId}</Text>
        )}
      </View>
      <View style={styles.rightSection}>
        {userPasswords[item.uid] && (
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordLabel}>パスワード</Text>
            <Text style={styles.passwordValue}>{userPasswords[item.uid]}</Text>
          </View>
        )}
        <View style={styles.actions}>
          {/* 編集ボタンは非表示に（カード全体タップで編集） */}
          <Button
            title="削除"
            onPress={() => handleDeletePress(item)}
            variant="outline"
            size="small"
            style={{
              minWidth: 80,
              borderColor: colors.error,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
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
        data={filteredUserList}
        renderItem={renderItem}
        keyExtractor={(user: User) => user.uid}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View>
            <View>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "検索結果が見つかりません"
                  : "ユーザーが登録されていません"}
              </Text>
            </View>
          </View>
        }
      />
      {showDeleteModal && deleteTarget && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 12,
              minWidth: 260,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 16,
              }}
            >
              {deleteTarget.nickname}を削除しますか？
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <Button
                title="キャンセル"
                onPress={handleDeleteCancel}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="はい"
                onPress={handleDeleteConfirm}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// エクスポートは上部で直接行うように修正
