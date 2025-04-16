import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { colors } from "@/constants/theme";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  position?: "left" | "right";
};

export const WebTimeSelect: React.FC<Props> = ({
  value,
  onChange,
  position = "left",
}) => {
  // 9:00 から 22:00 までの30分刻みの時間を生成
  const timeOptions = [];
  const startHour = 9;
  const endHour = 22;

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      timeOptions.push(time);
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [hours, minutes] = event.target.value.split(":").map(Number);
    const newDate = new Date(value);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  };

  const formatTimeOption = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <View style={styles.container}>
      <select
        value={formatTimeOption(value)}
        onChange={handleChange}
        style={styles.select}
        aria-label="時間を選択"
      >
        {timeOptions.map((time) => (
          <option key={time.getTime()} value={formatTimeOption(time)}>
            {formatTimeOption(time)}
          </option>
        ))}
      </select>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 160 : 120,
  },
  select: {
    WebkitAppearance: "none",
    appearance: "none",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: Platform.OS === "web" ? 14 : 10,
    fontSize: Platform.OS === "web" ? 16 : 14,
    fontWeight: "600",
    color: colors.text.primary,
    width: "100%",
    minWidth: Platform.OS === "web" ? 120 : 90,
    maxWidth: Platform.OS === "web" ? 160 : 120,
    cursor: "pointer",
    textAlign: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    outlineStyle: "none",
  } as any,
});
