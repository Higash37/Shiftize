import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { auth } from "@/services/firebase";

type MasterHeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
};

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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  signOutButton: {
    padding: 8,
  },
});
