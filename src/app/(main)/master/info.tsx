import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { InfoDashboard } from "@/modules/master-view";

export default function InfoPage() {
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="経営ダッシュボード" showBackButton={false} />
      <View style={styles.content}>
        <InfoDashboard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
