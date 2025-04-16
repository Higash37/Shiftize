import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ShiftItem, ShiftStatus } from "@/types/shift";
import { colors } from "@/constants/theme";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ShiftListProps {
  shifts: ShiftItem[];
  onToggleDetails: (shiftId: string) => void;
  showDetails: { [key: string]: boolean };
}

const getShiftTypeText = (type: "staff" | "class" | "deleted") => {
  switch (type) {
    case "staff":
      return "スタッフ";
    case "class":
      return "講師";
    case "deleted":
      return "削除済み";
    default:
      return "";
  }
};

const getStatusText = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return "未実施";
    case "pending":
      return "申請許可待ち";
    case "approved":
      return "承認済み";
    case "completed":
      return "実施済み";
    case "deleted":
      return "削除済み";
    default:
      return "";
  }
};

const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return colors.shift.draft;
    case "pending":
      return colors.shift.pending;
    case "approved":
      return colors.shift.approved;
    case "completed":
      return colors.shift.completed;
    case "deleted":
      return colors.shift.deleted;
    default:
      return colors.shift.draft;
  }
};

export const ShiftList: React.FC<ShiftListProps> = ({
  shifts,
  onToggleDetails,
  showDetails,
}) => {
  return (
    <View style={styles.container}>
      {shifts.map((shift) => (
        <View
          key={shift.id}
          style={[
            styles.shiftItem,
            { borderColor: getStatusColor(shift.status) },
          ]}
        >
          <View style={styles.shiftInfo}>
            <Text style={styles.dateTime}>
              {format(new Date(shift.date), "M月d日(E)", { locale: ja })}{" "}
              {format(new Date(shift.startTime), "HH:mm")} ~{" "}
              {format(new Date(shift.endTime), "HH:mm")}
            </Text>
            <Text style={styles.shiftType}>{getShiftTypeText(shift.type)}</Text>
          </View>
          <View style={styles.rightContainer}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(shift.status) },
              ]}
            >
              {getStatusText(shift.status)}
            </Text>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => onToggleDetails(shift.id)}
            >
              <Text style={styles.detailsButtonText}>詳細</Text>
              <AntDesign
                name={showDetails[shift.id] ? "up" : "down"}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          {showDetails[shift.id] && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>シフト詳細</Text>
                <View style={styles.timelineContainer}>
                  {/* スタッフ時間（授業前） */}
                  <View style={styles.timeSlot}>
                    <Text style={styles.timeSlotTitle}>スタッフ時間</Text>
                    <Text style={styles.detailsText}>
                      {format(new Date(shift.startTime), "HH:mm")} ~{" "}
                      {format(
                        new Date(
                          shift.classes?.[0]?.startTime || shift.endTime
                        ),
                        "HH:mm"
                      )}
                    </Text>
                  </View>

                  {/* 授業時間 */}
                  {shift.classes?.map((classTime, index) => (
                    <React.Fragment key={index}>
                      <View style={[styles.timeSlot, styles.classTimeSlot]}>
                        <Text
                          style={[
                            styles.timeSlotTitle,
                            { color: colors.primary },
                          ]}
                        >
                          授業時間
                        </Text>
                        <Text
                          style={[
                            styles.detailsText,
                            { color: colors.primary },
                          ]}
                        >
                          {format(new Date(classTime.startTime), "HH:mm")} ~{" "}
                          {format(new Date(classTime.endTime), "HH:mm")}
                        </Text>
                      </View>
                      {/* 授業と授業の間のスタッフ時間 */}
                      {shift.classes?.[index + 1] && (
                        <View style={styles.timeSlot}>
                          <Text style={styles.timeSlotTitle}>スタッフ時間</Text>
                          <Text style={styles.detailsText}>
                            {format(new Date(classTime.endTime), "HH:mm")} ~{" "}
                            {format(
                              new Date(shift.classes[index + 1].startTime),
                              "HH:mm"
                            )}
                          </Text>
                        </View>
                      )}
                    </React.Fragment>
                  ))}

                  {/* 最後のスタッフ時間（授業後） */}
                  {shift.classes && shift.classes.length > 0 && (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeSlotTitle}>スタッフ時間</Text>
                      <Text style={styles.detailsText}>
                        {format(
                          new Date(
                            shift.classes[shift.classes.length - 1].endTime
                          ),
                          "HH:mm"
                        )}{" "}
                        ~ {format(new Date(shift.endTime), "HH:mm")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>担当者</Text>
                <Text style={styles.detailsText}>{shift.nickname}</Text>
              </View>

              {shift.requestedChanges && (
                <View style={styles.changesContainer}>
                  <Text style={styles.changesTitle}>変更申請内容:</Text>
                  {shift.requestedChanges.startTime && (
                    <Text style={styles.changesText}>
                      開始時間: {shift.requestedChanges.startTime}
                    </Text>
                  )}
                  {shift.requestedChanges.endTime && (
                    <Text style={styles.changesText}>
                      終了時間: {shift.requestedChanges.endTime}
                    </Text>
                  )}
                  {shift.requestedChanges.date && (
                    <Text style={styles.changesText}>
                      日付:{" "}
                      {format(
                        new Date(shift.requestedChanges.date),
                        "yyyy年M月d日(E)",
                        { locale: ja }
                      )}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  shiftItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  shiftType: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  detailSection: {
    gap: 4,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  detailsText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  changesContainer: {
    marginTop: 8,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  changesText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  timelineContainer: {
    gap: 8,
  },
  timeSlot: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
  },
  classTimeSlot: {
    backgroundColor: `${colors.primary}10`,
  },
  timeSlotTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.secondary,
    marginBottom: 2,
  },
});
