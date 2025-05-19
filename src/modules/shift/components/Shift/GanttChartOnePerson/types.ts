import { ViewStyle, TextStyle } from "react-native";

export interface TimeSlot {
  start: string; // '14:00'
  end: string; // '15:30'
}

export interface GanttChartOnePersonProps {
  nickname: string;
  startTime: Date;
  endTime: Date;
  lessons: TimeSlot[]; // 授業時間
}

export interface GanttChartOnePersonStyles {
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
