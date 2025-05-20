import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";
import { GanttChartOnePersonProps, TimeSlot } from "./types";

export default function GanttChartOnePerson({
  nickname,
  startTime,
  endTime,
  lessons,
}: GanttChartOnePersonProps) {
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
