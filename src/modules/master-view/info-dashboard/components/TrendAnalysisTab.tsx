import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

type PeriodType = "3months" | "6months" | "1year";

export const TrendAnalysisTab: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("3months");

  const trendData = {
    "3months": {
      labels: ["1月", "2月", "3月"],
      workHours: [280, 295, 312],
      costs: [420000, 435000, 387000],
      efficiency: [82, 85, 89],
    },
    "6months": {
      labels: ["10月", "11月", "12月", "1月", "2月", "3月"],
      workHours: [295, 285, 275, 280, 295, 312],
      costs: [445000, 428000, 415000, 420000, 435000, 387000],
      efficiency: [78, 80, 79, 82, 85, 89],
    },
    "1year": {
      labels: [
        "4月",
        "5月",
        "6月",
        "7月",
        "8月",
        "9月",
        "10月",
        "11月",
        "12月",
        "1月",
        "2月",
        "3月",
      ],
      workHours: [305, 318, 332, 345, 298, 285, 295, 285, 275, 280, 295, 312],
      costs: [
        458000, 477000, 498000, 518000, 447000, 428000, 445000, 428000, 415000,
        420000, 435000, 387000,
      ],
      efficiency: [75, 76, 78, 82, 78, 77, 78, 80, 79, 82, 85, 89],
    },
  };

  const currentData = trendData[selectedPeriod];

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: "3months", label: "3ヶ月" },
        { key: "6months", label: "6ヶ月" },
        { key: "1year", label: "1年" },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period.key as PeriodType)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTrendChart = (
    data: number[],
    label: string,
    color: string,
    unit: string = ""
  ) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{label}</Text>
        <View style={styles.chart}>
          {data.map((value, index) => {
            const height =
              range > 0 ? ((value - minValue) / range) * 60 + 20 : 40;
            const isLast = index === data.length - 1;
            const trend = index > 0 ? value - data[index - 1] : 0;

            return (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height,
                        backgroundColor: isLast ? color : color + "60",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartValue}>
                  {typeof value === "number" && value >= 1000
                    ? `${(value / 1000).toFixed(0)}k`
                    : value.toString()}
                  {unit}
                </Text>
                <Text style={styles.chartLabel}>
                  {currentData.labels[index]}
                </Text>
                {trend !== 0 && (
                  <MaterialIcons
                    name={trend > 0 ? "trending-up" : "trending-down"}
                    size={12}
                    color={
                      trend > 0 ? colors.success || "#4CAF50" : colors.error
                    }
                    style={styles.trendIcon}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data[data.length - 1];
    const previous = data[data.length - 2];
    return ((recent - previous) / previous) * 100;
  };

  const renderTrendSummary = () => {
    const workHoursTrend = calculateTrend(currentData.workHours);
    const costsTrend = calculateTrend(currentData.costs);
    const efficiencyTrend = calculateTrend(currentData.efficiency);

    return (
      <View style={styles.trendSummary}>
        <View style={styles.trendItem}>
          <MaterialIcons
            name="schedule"
            size={20}
            color={workHoursTrend >= 0 ? colors.primary : colors.error}
          />
          <Text style={styles.trendLabel}>稼働時間</Text>
          <Text
            style={[
              styles.trendValue,
              {
                color:
                  workHoursTrend >= 0
                    ? colors.success || "#4CAF50"
                    : colors.error,
              },
            ]}
          >
            {workHoursTrend > 0 ? "+" : ""}
            {workHoursTrend.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.trendItem}>
          <MaterialIcons
            name="attach-money"
            size={20}
            color={costsTrend <= 0 ? colors.success || "#4CAF50" : colors.error}
          />
          <Text style={styles.trendLabel}>人件費</Text>
          <Text
            style={[
              styles.trendValue,
              {
                color:
                  costsTrend <= 0 ? colors.success || "#4CAF50" : colors.error,
              },
            ]}
          >
            {costsTrend > 0 ? "+" : ""}
            {costsTrend.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.trendItem}>
          <MaterialIcons
            name="trending-up"
            size={20}
            color={
              efficiencyTrend >= 0 ? colors.success || "#4CAF50" : colors.error
            }
          />
          <Text style={styles.trendLabel}>効率性</Text>
          <Text
            style={[
              styles.trendValue,
              {
                color:
                  efficiencyTrend >= 0
                    ? colors.success || "#4CAF50"
                    : colors.error,
              },
            ]}
          >
            {efficiencyTrend > 0 ? "+" : ""}
            {efficiencyTrend.toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 期間選択 */}
      <Box variant="card" style={styles.selectorCard}>
        <Text style={styles.sectionTitle}>期間選択</Text>
        {renderPeriodSelector()}
        {renderTrendSummary()}
      </Box>

      {/* 稼働時間トレンド */}
      <Box variant="card" style={styles.chartCard}>
        {renderTrendChart(
          currentData.workHours,
          "稼働時間トレンド",
          colors.primary,
          "h"
        )}
      </Box>

      {/* 人件費トレンド */}
      <Box variant="card" style={styles.chartCard}>
        {renderTrendChart(
          currentData.costs,
          "人件費トレンド",
          colors.secondary,
          ""
        )}
      </Box>

      {/* 効率性トレンド */}
      <Box variant="card" style={styles.chartCard}>
        {renderTrendChart(
          currentData.efficiency,
          "効率性トレンド",
          colors.success || "#4CAF50",
          "%"
        )}
      </Box>

      {/* 予測・提案 */}
      <Box variant="card" style={styles.predictionCard}>
        <Text style={styles.sectionTitle}>予測・提案</Text>

        <View style={styles.predictions}>
          <View style={styles.predictionItem}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color={colors.success || "#4CAF50"}
            />
            <View style={styles.predictionContent}>
              <Text style={styles.predictionTitle}>効率向上トレンド</Text>
              <Text style={styles.predictionText}>
                過去3ヶ月で効率が継続的に向上しています。この傾向が続けば来月は92%の効率が期待できます。
              </Text>
            </View>
          </View>

          <View style={styles.predictionItem}>
            <MaterialIcons name="savings" size={24} color={colors.primary} />
            <View style={styles.predictionContent}>
              <Text style={styles.predictionTitle}>コスト最適化</Text>
              <Text style={styles.predictionText}>
                人件費が前月比11%削減されました。効率的なシフト配置により更なる最適化が可能です。
              </Text>
            </View>
          </View>

          <View style={styles.predictionItem}>
            <MaterialIcons
              name="schedule"
              size={24}
              color={colors.warning || "#FF9800"}
            />
            <View style={styles.predictionContent}>
              <Text style={styles.predictionTitle}>繁忙期対策</Text>
              <Text style={styles.predictionText}>
                季節的な稼働時間の増加が予想されます。スタッフの増員やシフト調整を検討してください。
              </Text>
            </View>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  selectorCard: {
    marginBottom: layout.padding.medium,
  },
  chartCard: {
    marginBottom: layout.padding.medium,
  },
  predictionCard: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.medium,
    padding: 4,
    marginBottom: layout.padding.medium,
  },
  periodButton: {
    flex: 1,
    paddingVertical: layout.padding.small,
    alignItems: "center",
    borderRadius: layout.borderRadius.small,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  periodButtonTextActive: {
    color: colors.text.white,
    fontWeight: "600",
  },
  trendSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
  },
  trendItem: {
    alignItems: "center",
    flex: 1,
  },
  trendLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 2,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  chartContainer: {
    marginBottom: layout.padding.small,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: layout.padding.small,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  chartBarContainer: {
    height: 80,
    justifyContent: "flex-end",
    width: "100%",
  },
  chartBar: {
    width: "100%",
    borderRadius: 2,
    minHeight: 4,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 4,
    textAlign: "center",
  },
  chartLabel: {
    fontSize: 9,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: "center",
  },
  trendIcon: {
    marginTop: 2,
  },
  predictions: {
    marginTop: layout.padding.small,
  },
  predictionItem: {
    flexDirection: "row",
    marginBottom: layout.padding.medium,
    padding: layout.padding.medium,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  predictionContent: {
    flex: 1,
    marginLeft: layout.padding.medium,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
