
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { router } from "expo-router";
import { createHeaderStyles } from "./LayoutHeader.styles";
import { HeaderProps } from "./LayoutHeader.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";

export function Header({
  title,
  showBackButton = false,
  onBack,
  onPressSettings,
}: Readonly<HeaderProps>) {

  const styles = useThemedStyles(createHeaderStyles);
  const { colorScheme } = useMD3Theme();
  const { signOut } = useAuth();
  useExtendedFonts();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {

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
            <AntDesign
              name="arrow-left"
              size={24}
              color={colorScheme.onSurface}
            />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {onPressSettings && (
          <TouchableOpacity
            onPress={onPressSettings}
            style={styles.signOutButton}
          >
            <FontAwesome name="cog" size={24} color={colorScheme.onSurface} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <FontAwesome name="sign-out" size={24} color={colorScheme.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export { MasterHeader } from "./MasterHeader";
export default Header;
