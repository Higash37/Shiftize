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
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface StaffEfficiencyTabProps {
  budget: number;
}

interface StaffData {
  id: string;
  name: string;
  workedHours: number;
  targetHours: number;
  hourlyWage: number;
  efficiency: number;
}

export const StaffEfficiencyTab: React.FC<StaffEfficiencyTabProps> = ({
  budget,
}) => {
  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  // サンプルデータの生成
  useEffect(() => {
    const sampleData: StaffData[] = [
      {
        id: "1",
        name: "田中太郎",
        workedHours: 85,
        targetHours: 100,
        hourlyWage: 1200,
        efficiency: 85,
      },
      {
        id: "2",
        name: "佐藤花子",
        workedHours: 120,
        targetHours: 110,
        hourlyWage: 1300,
        efficiency: 109,
      },
      {
        id: "3",
        name: "鈴木一郎",
        workedHours: 78,
        targetHours: 90,
        hourlyWage: 1100,
        efficiency: 87,
      },
      {
        id: "4",
        name: "高橋美咲",
        workedHours: 95,
        targetHours: 100,
        hourlyWage: 1250,
        efficiency: 95,
      },
    ];
    setStaffData(sampleData);
  }, []);

  const totalWorkedHours = staffData.reduce(
    (sum, staff) => sum + staff.workedHours,
    0
  );
  const totalCost = staffData.reduce(
    (sum, staff) => sum + staff.workedHours * staff.hourlyWage,
    0
  );
  const budgetUsageRate = (totalCost / budget) * 100;

  const renderProgressBar = (
    percentage: number,
    color: string = colors.primary
  ) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{percentage.toFixed(1)}%</Text>
    </View>
  );

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return colors.success || "#4CAF50";
    if (efficiency >= 80) return colors.warning || "#FF9800";
    return colors.error;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* 全体サマリー */}
      <Box variant="card" style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>月間サマリー</Text>
        <View
          style={[
            styles.summaryGrid,
            isTabletOrDesktop && styles.summaryGridDesktop,
          ]}
        >
          <View style={styles.summaryItem}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>{totalWorkedHours}h</Text>
            <Text style={styles.summaryLabel}>総稼働時間</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialIcons
              name="attach-money"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.summaryValue}>
              ¥{totalCost.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>総人件費</Text>
          </View>
          <View style={styles.summaryItem}>
            <MaterialIcons name="pie-chart" size={24} color={colors.primary} />
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    budgetUsageRate > 100
                      ? colors.error
                      : colors.success || "#4CAF50",
                },
              ]}
            >
              {budgetUsageRate.toFixed(1)}%
            </Text>
            <Text style={styles.summaryLabel}>予算使用率</Text>
          </View>
        </View>
      </Box>

      {/* スタッフ別稼働率 */}
      <Box variant="card" style={styles.staffCard}>
        <Text style={styles.sectionTitle}>スタッフ別稼働状況</Text>
        {staffData.map((staff) => (
          <View key={staff.id} style={styles.staffItem}>
            <View style={styles.staffHeader}>
              <Text style={styles.staffName}>{staff.name}</Text>
              <Text style={styles.staffHours}>
                {staff.workedHours}h / {staff.targetHours}h
              </Text>
            </View>

            {renderProgressBar(
              staff.efficiency,
              getEfficiencyColor(staff.efficiency)
            )}

            <View style={styles.staffDetails}>
              <Text style={styles.staffDetailText}>
                時給: ¥{staff.hourlyWage.toLocaleString()}
              </Text>
              <Text style={styles.staffDetailText}>
                月額: ¥{(staff.workedHours * staff.hourlyWage).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </Box>

      {/* 効率性指標 */}
      <Box variant="card" style={styles.metricsCard}>
        <Text style={styles.sectionTitle}>効率性指標</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              ¥{(totalCost / totalWorkedHours).toFixed(0)}
            </Text>
            <Text style={styles.metricLabel}>時間あたりコスト</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{staffData.length}人</Text>
            <Text style={styles.metricLabel}>稼働スタッフ数</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {(totalWorkedHours / staffData.length).toFixed(1)}h
            </Text>
            <Text style={styles.metricLabel}>平均稼働時間</Text>
          </View>
        </View>
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: layout.padding.medium,
  },
  staffCard: {
    marginBottom: layout.padding.medium,
  },
  metricsCard: {
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: layout.padding.medium,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryGridDesktop: {
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: "center",
  },
  staffItem: {
    marginBottom: layout.padding.medium,
    paddingBottom: layout.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  staffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  staffHours: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginRight: layout.padding.small,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    minWidth: 45,
    textAlign: "right",
  },
  staffDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  staffDetailText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
});
