import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthContext";
import { router } from "expo-router";
import { colors } from "../../constants/theme";

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
};

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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  signOutButton: {
    padding: 8,
  },
});

export default Header;
