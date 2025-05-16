import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/core/auth/useAuth";
import { router } from "expo-router";
import { colors } from "@/shared/constants/theme";
import { styles } from "./styles";
import { HeaderProps } from "./types";

/**
 * Header - 標準のヘッダーコンポーネント
 *
 * アプリケーションの上部に表示され、タイトルとナビゲーション機能を提供します。
 */
export function Header({ title, showBackButton = false, onBack }: HeaderProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <FontAwesome name="sign-out" size={24} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default Header;
