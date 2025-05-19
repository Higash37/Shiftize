import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-theme/ThemeColors";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { styles, getStatusColor } from "./styles";
import { ShiftListProps, ShiftTypeMap } from "./types";
import { Shift, ShiftStatus } from "@/modules/shift/types/shift";

/**
 * ShiftList - シフト一覧表示コンポーネント
 *
 * シフト情報のリストを表示し、各シフトの詳細情報を開閉式で確認できるコンポーネント。
 * シフトの状態（下書き、承認待ち、承認済み、完了、削除済み）に応じて視覚的に区別されます。
 */
export const ShiftList: React.FC<ShiftListProps> = ({
  shifts,
  onToggleDetails,
  showDetails,
}) => {
  // シフトタイプに応じたテキストを取得する関数
  const getShiftTypeText = (type: ShiftTypeMap) => {
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

  // シフトステータスに応じたテキストを取得する関数
  const getStatusText = (status: ShiftStatus) => {
    switch (status) {
      case "draft":
        return "未実施";
      case "pending":
        return "申請許可待ち";
      case "approved":
        return "承認済み";

      case "deleted":
        return "削除済み";
      default:
        return "";
    }
  };

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
            <Text style={styles.shiftType}>
              {getShiftTypeText(shift.type as ShiftTypeMap)}
            </Text>
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
                  {shift.classes?.map(
                    (
                      classTime: { startTime: string; endTime: string },
                      index: number
                    ) => (
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
                            <Text style={styles.timeSlotTitle}>
                              スタッフ時間
                            </Text>
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
                    )
                  )}

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
