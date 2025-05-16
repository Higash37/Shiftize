import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/shared/constants/theme";
import { auth } from "@/core/firebase/firebase";
import { styles } from "./styles";
import { MasterHeaderProps } from "./types";

/**
 * MasterHeader - マスター用ヘッダーコンポーネント
 *
 * 管理者画面用のヘッダーコンポーネントで、タイトルとナビゲーション機能を提供します。
 */
export function MasterHeader({
  title,
  showBackButton = false,
  onBack,
}: MasterHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <AntDesign name="left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <AntDesign name="logout" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default MasterHeader;
