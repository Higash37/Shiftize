import React from "react";
import { View, Text } from "react-native";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";

interface GanttRowMobileProps {
  time: string;
  names: string[];
  sampleSchedule: SampleScheduleColumn[];
  cellWidth: number;
  cellHeight: number;
  onCellPress?: (userName: string) => void;
}

export const GanttRowMobile: React.FC<GanttRowMobileProps> = ({
  time,
  names,
  sampleSchedule,
  cellWidth,
  cellHeight,
  onCellPress,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
      }}
    >
      <View
        style={[styles.positionCell, { width: cellWidth, height: cellHeight }]}
      >
        <Text style={styles.positionText}>{time}</Text>
      </View>
      {names.map((name) => {
        // 授業時間優先でslotを取得
        const classSlot = sampleSchedule
          .flatMap((col) => col.slots)
          .find(
            (s) =>
              s.name === name &&
              s.type === "class" &&
              ((time === s.start && time === s.end && time === "22:00") ||
                (time >= s.start && time < s.end))
          );
        const staffSlot = sampleSchedule
          .flatMap((col) => col.slots)
          .find(
            (s) =>
              s.name === name &&
              s.type !== "class" &&
              ((time === s.start && time === s.end && time === "22:00") ||
                (time >= s.start && time < s.end))
          );
        const slot = classSlot || staffSlot;
        return (
          <View
            key={name}
            style={[
              styles.cell,
              {
                width: cellWidth,
                height: cellHeight,
                backgroundColor: slot
                  ? slot.type === "class"
                    ? "#eee"
                    : slot.color || "#e3f2fd"
                  : undefined,
                borderColor: slot
                  ? slot.type === "class"
                    ? "#bbb"
                    : slot.color || "#90caf9"
                  : undefined,
                borderWidth: slot ? 1 : 0,
                opacity: slot ? 1 : 0.1,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onTouchEnd={() => onCellPress && onCellPress(name)}
          >
            {slot && <Text style={styles.taskText}>{slot.task}</Text>}
          </View>
        );
      })}
    </View>
  );
};
