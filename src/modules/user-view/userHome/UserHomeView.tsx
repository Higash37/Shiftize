import React from "react";
import { View, Text } from "react-native";
import { Header } from "@/common/common-ui/ui-layout";
import { userHomeViewStyles as styles } from "./UserHomeView.styles";
import type { UserHomeViewProps } from "./UserHomeView.types";

export const UserHomeView: React.FC<UserHomeViewProps> = () => (
  <View style={styles.container}>
    <Header title="ホーム" />
    <View style={styles.content}>
      <Text style={styles.title}>ようこそ！</Text>
      <Text style={styles.subtitle}>シフト管理アプリへ</Text>
    </View>
  </View>
);
