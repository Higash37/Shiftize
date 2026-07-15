
import React, { useState, useEffect } from "react";
import { TextInput, TextInputProps } from "react-native";

interface TimeInputProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {

  value: string;

  onChangeText: (value: string) => void;

  placeholder?: string;

  isError?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChangeText,
  placeholder = "00:00",
  isError = false,
  style,
  ...props
}) => {

  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {

    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  const formatTime = (input: string): string => {
    const numbers = input.replace(/\D/g, "");

    if (numbers === "") {
      return "";
    }

    if (numbers.length === 1) {
      const digit = Number.parseInt(numbers, 10);

      if (digit >= 3) {
        return "0" + numbers + ":";
      }

      return numbers;
    }

    if (numbers.length === 2) {
      const hour = Number.parseInt(numbers, 10);

      if (hour > 23) {
        return "23:";
      }

      return numbers + ":";
    }

    if (numbers.length === 3) {
      const hour = numbers.substring(0, 2);
      const minute = numbers.substring(2, 3);
      const hourNum = Number.parseInt(hour, 10);

      if (hourNum > 23) {
        return "23:" + minute;
      }
      return hour + ":" + minute;
    }

    if (numbers.length >= 4) {
      let hour = numbers.substring(0, 2);
      let minute = numbers.substring(2, 4);

      const hourNum = Number.parseInt(hour, 10);
      const minuteNum = Number.parseInt(minute, 10);

      if (hourNum > 23) {
        hour = "23";
      }

      if (minuteNum > 59) {
        minute = "59";
      }

      return hour + ":" + minute;
    }

    return numbers;
  };

  const handleTextChange = (text: string) => {

    if (text.length < displayValue.length) {

      if (displayValue.endsWith(":") && text === displayValue.slice(0, -1)) {
        setDisplayValue(text);
        return;
      }

      const numbers = text.replace(/\D/g, "");

      if (numbers === "") {
        setDisplayValue("");
        onChangeText("");
      } else {

        setDisplayValue(numbers);
      }
      return;
    }

    if (text.length > displayValue.length) {
      const formatted = formatTime(text);
      setDisplayValue(formatted);

      if (formatted.length === 5 && formatted.includes(":")) {
        onChangeText(formatted);
      } else if (formatted === "") {
        onChangeText("");
      }
      return;
    }

    const formatted = formatTime(text);
    setDisplayValue(formatted);

    if (formatted.length === 5 && formatted.includes(":")) {
      onChangeText(formatted);
    } else if (formatted === "") {
      onChangeText("");
    }
  };

  const completeWithoutColon = (value: string): string => {
    if (value.length === 1) {
      return "0" + value + ":00";
    }
    if (value.length === 2) {
      return value + ":00";
    }
    return value;
  };

  const completeWithIncompleteMinute = (parts: string[]): string => {
    if (parts[1]?.length === 1) {
      return parts[0] + ":" + parts[1] + "0";
    }
    if (parts[1] === undefined || parts[1] === "") {
      return parts[0] + ":00";
    }
    return parts.join(":");
  };

  const removeLeadingZero = (time: string): string => {
    const parts = time.split(":");
    if (parts[0] === "00" || parts[0] === "01" || parts[0] === "02") {
      const hour = Number.parseInt(parts[0], 10).toString();
      return hour + ":" + parts[1];
    }
    return time;
  };

  const handleBlur = () => {

    if (displayValue && displayValue.length < 5) {
      let completed = displayValue;

      if (completed.includes(":")) {

        const parts = completed.split(":");
        completed = completeWithIncompleteMinute(parts);
      } else {

        completed = completeWithoutColon(completed);
      }

      if (completed.length === 5) {
        completed = removeLeadingZero(completed);
      }

      setDisplayValue(completed);
      onChangeText(completed);
    }
  };

  return (
    <TextInput
      {...props}
      value={displayValue}
      onChangeText={handleTextChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      keyboardType="number-pad"
      maxLength={5}
      style={[style, isError && { borderColor: "#FF4444", borderWidth: 1 }]}
    />
  );
};
