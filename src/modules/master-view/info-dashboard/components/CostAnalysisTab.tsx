import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface CostAnalysisTabProps {
  budget: number;
}

export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({ budget }) => {
  const [costData, setCostData] = useState({
    totalCost: 387000,
    lastMonthCost: 425000,
    fixedCosts: 120000,
    variableCosts: 267000,
    overtimeCosts: 45000,
  });

  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  const budgetUsage = (costData.totalCost / budget) * 100;
  const costChange =
    ((costData.totalCost - costData.lastMonthCost) / costData.lastMonthCost) *
    100;
  const remainingBudget = budget - costData.totalCost;

  const renderCostBar = (
    amount: number,
    total: number,
    color: string,
    label: string
  ) => {
    const percentage = (amount / total) * 100;
    return (
      <View style={styles.costBarContainer}>
        <View style={styles.costBarHeader}>
          <Text style={styles.costBarLabel}>{label}</Text>
          <Text style={styles.costBarAmount}>¥{amount.toLocaleString()}</Text>
        </View>
        <View style={styles.costBarBg}>
          <View
            style={[
              styles.costBarFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.costBarPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    );
  };

  const getCostChangeColor = (change: number) => {
    if (change > 0) return colors.error;
    if (change < -5) return colors.success || "#4CAF50";
    return colors.warning || "#FF9800";
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 予算vs実績 */}
      <Box variant="card" style={styles.budgetCard}>
        <Text style={styles.sectionTitle}>予算 vs 実績</Text>

        <View style={styles.budgetComparison}>
          <View style={styles.budgetItem}>
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.budgetValue}>¥{budget.toLocaleString()}</Text>
            <Text style={styles.budgetLabel}>月間予算</Text>
          </View>

          <View style={styles.budgetItem}>
            <MaterialIcons
              name="trending-down"
              size={24}
              color={
                costData.totalCost > budget
                  ? colors.error
                  : colors.success || "#4CAF50"
              }
            />
            <Text
              style={[
                styles.budgetValue,
                {
                  color:
                    costData.totalCost > budget
                      ? colors.error
                      : colors.text.primary,
                },
              ]}
            >
              ¥{costData.totalCost.toLocaleString()}
            </Text>
            <Text style={styles.budgetLabel}>実績</Text>
          </View>

          <View style={styles.budgetItem}>
            <MaterialIcons
              name="savings"
              size={24}
              color={
                remainingBudget >= 0
                  ? colors.success || "#4CAF50"
                  : colors.error
              }
            />
            <Text
              style={[
                styles.budgetValue,
                {
                  color:
                    remainingBudget >= 0
                      ? colors.success || "#4CAF50"
                      : colors.error,
                },
              ]}
            >
              ¥{Math.abs(remainingBudget).toLocaleString()}
            </Text>
            <Text style={styles.budgetLabel}>
              {remainingBudget >= 0 ? "残予算" : "予算超過"}
            </Text>
          </View>
        </View>

        <View style={styles.budgetProgress}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetUsage, 100)}%`,
                  backgroundColor:
                    budgetUsage > 100
                      ? colors.error
                      : budgetUsage > 80
                      ? colors.warning || "#FF9800"
                      : colors.success || "#4CAF50",
                },
              ]}
            />
          </View>
          <Text style={styles.budgetUsageText}>
            予算使用率: {budgetUsage.toFixed(1)}%
          </Text>
        </View>
      </Box>

      {/* コスト内訳 */}
      <Box variant="card" style={styles.breakdownCard}>
        <Text style={styles.sectionTitle}>コスト内訳</Text>

        {renderCostBar(
          costData.fixedCosts,
          costData.totalCost,
          colors.primary,
          "固定費"
        )}
        {renderCostBar(
          costData.variableCosts,
          costData.totalCost,
          colors.secondary,
          "変動費"
        )}
        {renderCostBar(
          costData.overtimeCosts,
          costData.totalCost,
          colors.warning || "#FF9800",
          "残業代"
        )}
      </Box>

      {/* 前月比較 */}
      <Box variant="card" style={styles.comparisonCard}>
        <Text style={styles.sectionTitle}>前月比較</Text>

        <View style={styles.comparisonGrid}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonValue}>
              ¥{costData.lastMonthCost.toLocaleString()}
            </Text>
            <Text style={styles.comparisonLabel}>前月実績</Text>
          </View>

          <View style={styles.comparisonItem}>
            <Text
              style={[
                styles.comparisonValue,
                { color: getCostChangeColor(costChange) },
              ]}
            >
              {costChange > 0 ? "+" : ""}
              {costChange.toFixed(1)}%
            </Text>
            <Text style={styles.comparisonLabel}>増減率</Text>
          </View>

          <View style={styles.comparisonItem}>
            <Text
              style={[
                styles.comparisonValue,
                { color: getCostChangeColor(costChange) },
              ]}
            >
              ¥
              {Math.abs(
                costData.totalCost - costData.lastMonthCost
              ).toLocaleString()}
            </Text>
            <Text style={styles.comparisonLabel}>
              {costChange > 0 ? "増加" : "削減"}
            </Text>
          </View>
        </View>
      </Box>

      {/* コスト効率指標 */}
      <Box variant="card" style={styles.efficiencyCard}>
        <Text style={styles.sectionTitle}>コスト効率指標</Text>

        <View style={styles.efficiencyGrid}>
          <View style={styles.efficiencyItem}>
            <MaterialIcons name="timeline" size={20} color={colors.primary} />
            <Text style={styles.efficiencyValue}>¥1,387</Text>
            <Text style={styles.efficiencyLabel}>時間あたりコスト</Text>
          </View>

          <View style={styles.efficiencyItem}>
            <MaterialIcons name="person" size={20} color={colors.primary} />
            <Text style={styles.efficiencyValue}>¥96,750</Text>
            <Text style={styles.efficiencyLabel}>スタッフあたり</Text>
          </View>

          <View style={styles.efficiencyItem}>
            <MaterialIcons
              name="trending-up"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.efficiencyValue}>77.4%</Text>
            <Text style={styles.efficiencyLabel}>予算効率</Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  budgetCard: {
    marginBottom: layout.padding.medium,
  },
  breakdownCard: {
    marginBottom: layout.padding.medium,
  },
  comparisonCard: {
    marginBottom: layout.padding.medium,
  },
  efficiencyCard: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  budgetComparison: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: layout.padding.medium,
  },
  budgetItem: {
    alignItems: "center",
    flex: 1,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 4,
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: "center",
  },
  budgetProgress: {
    marginTop: layout.padding.small,
  },
  progressBg: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    marginBottom: layout.padding.small,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  budgetUsageText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  costBarContainer: {
    marginBottom: layout.padding.medium,
  },
  costBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  costBarLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  costBarAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  costBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 4,
  },
  costBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  costBarPercentage: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: "right",
  },
  comparisonGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  comparisonItem: {
    alignItems: "center",
    flex: 1,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  comparisonLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
  efficiencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  efficiencyItem: {
    alignItems: "center",
    flex: 1,
  },
  efficiencyValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  efficiencyLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
});
