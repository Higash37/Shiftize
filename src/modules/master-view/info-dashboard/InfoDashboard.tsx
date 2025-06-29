import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import {
  BudgetSection,
  StaffEfficiencyTab,
  CostAnalysisTab,
  ShiftMetricsTab,
  ProductivityTab,
  TrendAnalysisTab,
} from "./components";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";
import Button from "@/common/common-ui/ui-forms/FormButton";

type TabType = "efficiency" | "cost" | "shift" | "productivity" | "trend";

interface TabItem {
  key: TabType;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { key: "efficiency", label: "スタッフ稼働", icon: "people" },
  { key: "cost", label: "人件費分析", icon: "attach-money" },
  { key: "shift", label: "シフト指標", icon: "schedule" },
  { key: "productivity", label: "生産性", icon: "trending-up" },
  { key: "trend", label: "トレンド", icon: "analytics" },
];

export const InfoDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("efficiency");
  const [monthlyBudget, setMonthlyBudget] = useState<number>(500000); // デフォルト予算
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInputValue, setBudgetInputValue] = useState(
    monthlyBudget.toString()
  );
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  const handleBudgetSave = () => {
    const numericValue = parseInt(budgetInputValue.replace(/,/g, ""), 10);
    if (!isNaN(numericValue)) {
      setMonthlyBudget(numericValue);
    }
    setShowBudgetModal(false);
  };

  const openBudgetModal = () => {
    setBudgetInputValue(monthlyBudget.toString());
    setShowBudgetModal(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "efficiency":
        return <StaffEfficiencyTab budget={monthlyBudget} />;
      case "cost":
        return <CostAnalysisTab budget={monthlyBudget} />;
      case "shift":
        return <ShiftMetricsTab />;
      case "productivity":
        return <ProductivityTab />;
      case "trend":
        return <TrendAnalysisTab />;
      default:
        return <StaffEfficiencyTab budget={monthlyBudget} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* タブナビゲーション */}
      <View
        style={[
          styles.tabContainer,
          isTabletOrDesktop && styles.tabContainerDesktop,
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {/* 月間予算表示 */}
          <TouchableOpacity
            style={[
              styles.budgetTab,
              isTabletOrDesktop && styles.budgetTabDesktop,
            ]}
            onPress={openBudgetModal}
          >
            <MaterialIcons
              name="account-balance"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.budgetTabText}>
              月間予算設定 {formatCurrency(monthlyBudget)}
            </Text>
          </TouchableOpacity>

          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
                isTabletOrDesktop && styles.tabDesktop,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialIcons
                name={tab.icon as any}
                size={20}
                color={
                  activeTab === tab.key ? colors.primary : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* タブコンテンツ */}
      <ScrollView style={styles.contentContainer}>
        {renderTabContent()}
      </ScrollView>

      {/* プレビュー段階オーバーレイ */}
      <View style={styles.previewOverlay}>
        <View style={styles.previewBadge}>
          <MaterialIcons name="construction" size={16} color={colors.warning} />
          <Text style={styles.previewText}>プレビュー中</Text>
        </View>
        <Text style={styles.previewDescription}>
          この機能は開発中です。実際のデータとは異なる場合があります。
        </Text>
      </View>

      {/* 予算編集モーダル */}
      <Modal
        visible={showBudgetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBudgetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Box variant="card" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons
                name="account-balance"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.modalTitle}>月間予算設定</Text>
              <TouchableOpacity
                onPress={() => setShowBudgetModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>¥</Text>
                <TextInput
                  style={styles.modalInput}
                  value={budgetInputValue}
                  onChangeText={setBudgetInputValue}
                  keyboardType="numeric"
                  placeholder="500000"
                  placeholderTextColor={colors.text.disabled}
                  autoFocus={true}
                />
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <Button
                title="キャンセル"
                onPress={() => setShowBudgetModal(false)}
                variant="outline"
                size="medium"
                style={styles.modalButton}
              />
              <Button
                title="保存"
                onPress={handleBudgetSave}
                variant="primary"
                size="medium"
                style={styles.modalButton}
              />
            </View>
          </Box>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: "relative",
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  tabContainerDesktop: {
    paddingHorizontal: layout.padding.large,
  },
  tabScrollContainer: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
  },
  budgetTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    marginRight: layout.padding.medium,
    borderRadius: layout.borderRadius.medium,
    backgroundColor: colors.primary + "15",
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  budgetTabDesktop: {
    paddingHorizontal: layout.padding.large,
  },
  budgetTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 6,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    marginRight: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    minWidth: 100,
  },
  tabDesktop: {
    minWidth: 120,
    paddingHorizontal: layout.padding.large,
  },
  activeTab: {
    backgroundColor: colors.primary + "15",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: layout.padding.medium,
  },
  // プレビューオーバーレイ関連のスタイル
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.03)", // より薄い半透明オーバーレイ
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none", // タッチイベントを透過
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "E6", // 警告色 + 90%不透明度
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    borderRadius: layout.borderRadius.large,
    marginBottom: layout.padding.small,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.warning + "40",
  },
  previewText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
    marginLeft: 6,
  },
  previewDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
    backgroundColor: colors.surface + "F5", // サーフェス色 + 96%不透明度
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    borderRadius: layout.borderRadius.medium,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border + "60",
  },
  // モーダル関連のスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding.large,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.large,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: layout.padding.small,
  },
  closeButton: {
    padding: 4,
  },
  modalInputContainer: {
    marginBottom: layout.padding.large,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    ...shadows.small,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    paddingVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: layout.padding.medium,
  },
  modalButton: {
    minWidth: 80,
  },
});
