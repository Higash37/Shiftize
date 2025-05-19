import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { MasterHeader } from "@/common/common-ui/ui-layout";

export default function MasterHomeScreen() {
  return (
    <View style={styles.container}>
      <MasterHeader title="ホーム" />
      <View style={styles.content}>
        <Text style={styles.title}>ようこそ！</Text>
        <Text style={styles.subtitle}>マスター管理画面へ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
