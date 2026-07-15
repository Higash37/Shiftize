
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { ServiceProvider } from "@/services/ServiceProvider";
import { createHeaderStyles } from "./LayoutHeader.styles";
import { MasterHeaderProps } from "./LayoutHeader.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

export function MasterHeader({
  title,
  showBackButton = false,
  onBack,
}: Readonly<MasterHeaderProps>) {

  const styles = useThemedStyles(createHeaderStyles);
  const { colorScheme } = useMD3Theme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 900;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSignOut = async () => {
    try {
      await ServiceProvider.auth.signOut();
      router.replace("/(auth)/login");
    } catch (error) {

    }
  };

  return (
    <View style={[styles.header, isCompactLayout && styles.headerCompact]}>
      <View
        style={[
          styles.leftContainer,
          isCompactLayout && styles.leftContainerCompact,
        ]}
      >
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <AntDesign name="left" size={24} color={colorScheme.onSurface} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, isCompactLayout && styles.titleCompact]}>
          {title}
        </Text>
      </View>
      <View
        style={[
          styles.rightContainer,
          isCompactLayout && styles.rightContainerCompact,
        ]}
      >
        {}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[
            styles.signOutButton,
            isCompactLayout && styles.compactActionButton,
          ]}
        >
          <AntDesign name="logout" size={24} color={colorScheme.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
export default MasterHeader;
