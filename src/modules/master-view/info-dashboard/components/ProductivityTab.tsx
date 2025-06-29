import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

export const ProductivityTab: React.FC = () => {
  const [productivityData] = useState({
    tasksCompleted: 342,
    averageTaskTime: 12.5,
    productivityScore: 87.3,
    peakHours: "14:00-17:00",
    efficiency: 92.1,
    qualityScore: 94.5,
  });

  const renderProductivityCard = (
    icon: string,
    value: string,
    label: string,
    description: string,
    color: string = colors.primary,
    trend?: number
  ) => (
    <View style={styles.productivityCard}>
      <View style={styles.cardHeader}>
        <MaterialIcons name={icon as any} size={28} color={color} />
        {trend !== undefined && (
          <View style={styles.trendBadge}>
            <MaterialIcons
              name={trend >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={trend >= 0 ? colors.success || "#4CAF50" : colors.error}
            />
            <Text
              style={[
                styles.trendValue,
                {
                  color:
                    trend >= 0 ? colors.success || "#4CAF50" : colors.error,
                },
              ]}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );

  const renderTimeSlotAnalysis = () => {
    const timeSlots = [
      { time: "09:00-12:00", productivity: 78, tasks: 45 },
      { time: "12:00-14:00", productivity: 65, tasks: 32 },
      { time: "14:00-17:00", productivity: 95, tasks: 78 },
      { time: "17:00-20:00", productivity: 88, tasks: 67 },
      { time: "20:00-22:00", productivity: 72, tasks: 28 },
    ];

    return (
      <View style={styles.timeAnalysis}>
        {timeSlots.map((slot, index) => (
          <View key={index} style={styles.timeSlot}>
            <Text style={styles.timeSlotLabel}>{slot.time}</Text>
            <View style={styles.timeSlotMetrics}>
              <View style={styles.timeSlotProgress}>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${slot.productivity}%`,
                        backgroundColor:
                          slot.productivity >= 90
                            ? colors.success || "#4CAF50"
                            : slot.productivity >= 70
                            ? colors.warning || "#FF9800"
                            : colors.error,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.productivityPercent}>
                  {slot.productivity}%
                </Text>
              </View>
              <Text style={styles.taskCount}>{slot.tasks}件</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 主要生産性指標 */}
      <Box variant="card" style={styles.mainCard}>
        <Text style={styles.sectionTitle}>生産性指標</Text>

        <View style={styles.metricsGrid}>
          {renderProductivityCard(
            "assessment",
            `${productivityData.productivityScore}%`,
            "総合生産性スコア",
            "タスク完了率とクオリティの総合評価",
            colors.primary,
            5.2
          )}

          {renderProductivityCard(
            "speed",
            `${productivityData.efficiency}%`,
            "作業効率",
            "計画時間に対する実績効率",
            colors.success || "#4CAF50",
            2.8
          )}

          {renderProductivityCard(
            "star",
            `${productivityData.qualityScore}%`,
            "品質スコア",
            "作業品質の評価指標",
            colors.secondary,
            1.3
          )}

          {renderProductivityCard(
            "timer",
            `${productivityData.averageTaskTime}分`,
            "平均作業時間",
            "1タスクあたりの平均処理時間",
            colors.warning || "#FF9800",
            -3.1
          )}
        </View>
      </Box>

      {/* 時間帯別分析 */}
      <Box variant="card" style={styles.timeCard}>
        <Text style={styles.sectionTitle}>時間帯別生産性</Text>
        <Text style={styles.peakInfo}>
          <MaterialIcons
            name="trending-up"
            size={16}
            color={colors.success || "#4CAF50"}
          />{" "}
          ピーク時間: {productivityData.peakHours}
        </Text>
        {renderTimeSlotAnalysis()}
      </Box>

      {/* タスク分析 */}
      <Box variant="card" style={styles.taskCard}>
        <Text style={styles.sectionTitle}>タスク分析</Text>

        <View style={styles.taskMetrics}>
          <View style={styles.taskMetricItem}>
            <MaterialIcons
              name="done-all"
              size={24}
              color={colors.success || "#4CAF50"}
            />
            <Text style={styles.taskMetricValue}>
              {productivityData.tasksCompleted}
            </Text>
            <Text style={styles.taskMetricLabel}>完了タスク数</Text>
            <Text style={styles.taskMetricSubtext}>今月累計</Text>
          </View>

          <View style={styles.taskMetricItem}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={styles.taskMetricValue}>27.3</Text>
            <Text style={styles.taskMetricLabel}>日平均タスク数</Text>
            <Text style={styles.taskMetricSubtext}>1日あたり</Text>
          </View>

          <View style={styles.taskMetricItem}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color={colors.warning || "#FF9800"}
            />
            <Text style={styles.taskMetricValue}>113%</Text>
            <Text style={styles.taskMetricLabel}>目標達成率</Text>
            <Text style={styles.taskMetricSubtext}>月間目標比</Text>
          </View>
        </View>
      </Box>

      {/* 改善提案 */}
      <Box variant="card" style={styles.suggestionCard}>
        <Text style={styles.sectionTitle}>生産性向上の提案</Text>

        <View style={styles.suggestions}>
          <View style={styles.suggestionItem}>
            <MaterialIcons
              name="lightbulb"
              size={20}
              color={colors.warning || "#FF9800"}
            />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>ピーク時間の活用</Text>
              <Text style={styles.suggestionText}>
                14:00-17:00の高生産性時間帯により多くの重要タスクを配置
              </Text>
            </View>
          </View>

          <View style={styles.suggestionItem}>
            <MaterialIcons name="schedule" size={20} color={colors.primary} />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>休憩時間の最適化</Text>
              <Text style={styles.suggestionText}>
                12:00-14:00の低生産性時間に適切な休憩を配置
              </Text>
            </View>
          </View>

          <View style={styles.suggestionItem}>
            <MaterialIcons
              name="group"
              size={20}
              color={colors.success || "#4CAF50"}
            />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>チーム連携強化</Text>
              <Text style={styles.suggestionText}>
                高効率スタッフのノウハウ共有で全体レベル向上
              </Text>
            </View>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    marginBottom: layout.padding.medium,
  },
  timeCard: {
    marginBottom: layout.padding.medium,
  },
  taskCard: {
    marginBottom: layout.padding.medium,
  },
  suggestionCard: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productivityCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    marginBottom: layout.padding.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trendValue: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 14,
  },
  peakInfo: {
    fontSize: 14,
    color: colors.success || "#4CAF50",
    fontWeight: "500",
    marginBottom: layout.padding.medium,
    alignItems: "center",
  },
  timeAnalysis: {
    marginTop: layout.padding.small,
  },
  timeSlot: {
    marginBottom: layout.padding.medium,
  },
  timeSlotLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: layout.padding.small,
  },
  timeSlotMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSlotProgress: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: layout.padding.medium,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginRight: layout.padding.small,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  productivityPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    minWidth: 35,
  },
  taskCount: {
    fontSize: 12,
    color: colors.text.secondary,
    minWidth: 30,
    textAlign: "right",
  },
  taskMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  taskMetricItem: {
    alignItems: "center",
    flex: 1,
  },
  taskMetricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: layout.padding.small,
    marginBottom: 4,
  },
  taskMetricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 2,
  },
  taskMetricSubtext: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
  },
  suggestions: {
    marginTop: layout.padding.small,
  },
  suggestionItem: {
    flexDirection: "row",
    marginBottom: layout.padding.medium,
    padding: layout.padding.medium,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: layout.padding.medium,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
