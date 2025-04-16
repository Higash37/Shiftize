import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";

interface TimeSlot {
  start: string; // '14:00'
  end: string; // '15:30'
}

interface Props {
  nickname: string;
  startTime: Date;
  endTime: Date;
  lessons: TimeSlot[]; // 授業時間
}

interface Styles {
  container: ViewStyle;
  timelineContainer: ViewStyle;
  header: ViewStyle;
  name: TextStyle;
  timeline: ViewStyle;
  row: ViewStyle;
  timeLabel: TextStyle;
  bar: ViewStyle;
  shift: ViewStyle;
  lesson: ViewStyle;
}

export default function GanttChartOnePerson({
  nickname,
  startTime,
  endTime,
  lessons,
}: Props) {
  // 30分単位のタイムスロットを生成
  const timeSlots = [];
  for (let hour = 9; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  const isWithin = (timeStr: string, start: Date, end: Date) => {
    const [h, m] = timeStr.split(":").map(Number);
    const time = new Date(start);
    time.setHours(h, m, 0, 0);
    return time >= start && time < end;
  };

  const isLesson = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const t = new Date();
    t.setHours(h, m, 0, 0);
    return lessons.some(({ start, end }) => {
      const s = new Date();
      const e = new Date();
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      s.setHours(sh, sm, 0, 0);
      e.setHours(eh, em, 0, 0);
      return t >= s && t < e;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{nickname}</Text>
        </View>
        <View style={styles.timeline}>
          {timeSlots.map((time) => {
            const inShift = isWithin(time, startTime, endTime);
            const inLesson = isLesson(time);

            return (
              <View key={time} style={styles.row}>
                <Text style={styles.timeLabel}>{time}</Text>
                <View
                  style={[
                    styles.bar,
                    inLesson && styles.lesson,
                    inShift && !inLesson && styles.shift,
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    height: 500,
  },
  timelineContainer: {
    flexDirection: "row",
    height: "100%",
  },
  header: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  name: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2C3E50",
  },
  timeline: {
    flex: 1,
    overflow: Platform.OS === "web" ? "scroll" : "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 18,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  timeLabel: {
    width: 40,
    fontSize: 11,
    color: "#666",
    marginRight: 6,
  },
  bar: {
    flex: 1,
    height: 12,
    backgroundColor: "#F5F6FA",
    borderRadius: 3,
  },
  shift: {
    backgroundColor: "#4A90E2",
  },
  lesson: {
    backgroundColor: "#50E3C2",
  },
});
