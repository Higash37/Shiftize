import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Shift } from "@/hooks/useShift";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/constants/theme";

interface ShiftDetailsProps {
  shift: Shift;
  maxHeight?: number;
  isOpen: boolean;
}

export const ShiftDetails: React.FC<ShiftDetailsProps> = ({
  shift,
  maxHeight = 500,
  isOpen,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? maxHeight : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, maxHeight]);

  // 時間文字列をDate型に変換する関数
  const parseTimeString = (dateStr: string, timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date(dateStr);
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date;
  };

  return (
    <Animated.View style={[styles.container, { maxHeight: heightAnim }]}>
      <View style={styles.header}>
        <Text style={styles.nickname}>{shift.nickname}</Text>
        <Text style={styles.date}>
          {format(new Date(shift.date), "M月d日(E)", { locale: ja })}
        </Text>
      </View>

      <View style={styles.timeSlots}>
        {shift.classes?.length ? (
          <>
            {/* 最初のスタッフ時間 */}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>
              <Text style={styles.timeText}>
                {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}{" "}
                ~{" "}
                {format(
                  parseTimeString(shift.date, shift.classes[0].startTime),
                  "HH:mm"
                )}
              </Text>
            </View>

            {/* 授業時間とその間のスタッフ時間 */}
            {shift.classes.map(
              (
                classTime: { startTime: string; endTime: string },
                index: number
              ) => (
                <React.Fragment key={index}>
                  <View style={[styles.timeSlot, styles.classTimeSlot]}>
                    <Text style={[styles.timeSlotLabel, styles.classLabel]}>
                      授業
                    </Text>
                    <Text style={[styles.timeText, styles.classTime]}>
                      {format(
                        parseTimeString(shift.date, classTime.startTime),
                        "HH:mm"
                      )}{" "}
                      ~{" "}
                      {format(
                        parseTimeString(shift.date, classTime.endTime),
                        "HH:mm"
                      )}
                    </Text>
                  </View>

                  {shift.classes?.[index + 1] && (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeSlotLabel}>スタッフ</Text>
                      <Text style={styles.timeText}>
                        {format(
                          parseTimeString(shift.date, classTime.endTime),
                          "HH:mm"
                        )}{" "}
                        ~{" "}
                        {format(
                          parseTimeString(
                            shift.date,
                            shift.classes[index + 1].startTime
                          ),
                          "HH:mm"
                        )}
                      </Text>
                    </View>
                  )}
                </React.Fragment>
              )
            )}

            {/* 最後のスタッフ時間 */}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>
              <Text style={styles.timeText}>
                {format(
                  parseTimeString(
                    shift.date,
                    shift.classes[shift.classes.length - 1].endTime
                  ),
                  "HH:mm"
                )}{" "}
                ~ {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.timeSlot}>
            <Text style={styles.timeSlotLabel}>スタッフ</Text>
            <Text style={styles.timeText}>
              {format(parseTimeString(shift.date, shift.startTime), "HH:mm")} ~{" "}
              {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    marginBottom: 8,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  date: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  timeSlots: {
    gap: 8,
  },
  timeSlot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  classTimeSlot: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  timeSlotLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    width: 60,
  },
  classLabel: {
    color: colors.primary,
  },
  timeText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  classTime: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
