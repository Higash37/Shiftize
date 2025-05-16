import React from "react";
import { View, TextInput, Text, StyleProp, TextStyle } from "react-native";
import { colors } from "../../../constants/theme";
import { styles } from "./styles";
import { InputProps } from "./types";

/**
 * Input - 汎用的なテキスト入力コンポーネント
 *
 * ラベル、エラーメッセージ、ヘルパーテキストをサポートする入力フィールドです。
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={
          [
            styles.input,
            error ? styles.inputError : undefined,
            style,
          ] as StyleProp<TextStyle>
        }
        placeholderTextColor={colors.text.secondary}
        {...props}
      />
      {(error || helper) && (
        <Text
          style={
            [
              styles.helperText,
              error ? styles.errorText : undefined,
            ] as StyleProp<TextStyle>
          }
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

export default Input;
