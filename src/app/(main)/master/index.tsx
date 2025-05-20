import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useUser } from "@/modules/user-management/user-hooks/useUser";
import { colors, typography } from "@/common/common-constants/ThemeConstants";
import { User } from "@/common/common-models/model-user/UserModel";
import { MasterHeader } from "@/common/common-ui/ui-layout";

export default function MasterDashboard() {
  const { users, loading, error } = useUser();

  const StatCard = ({ title, value }: { title: string; value: number }) => (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const regularUsers =
    users?.filter((user: User) => user.role === "user") ?? [];

  return (
    <View style={styles.container}>
      <MasterHeader title="ダッシュボード" />
      <View style={styles.content}>
        <Text style={styles.title}>ダッシュボード</Text>
        <Text style={styles.subtitle}>マスター管理画面のトップページです</Text>

        <View style={styles.stats}>
          <StatCard title="総ユーザー数" value={users?.length ?? 0} />
          <StatCard title="一般ユーザー数" value={regularUsers.length} />
        </View>

        <Link href="/master/users" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>ユーザー管理へ</Text>
          </Pressable>
        </Link>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.medium,
    textAlign: "center",
    padding: 16,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  label: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
  },
  link: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  linkText: {
    color: colors.text.white,
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
  },
});
