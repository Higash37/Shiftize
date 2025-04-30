import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { colors } from "../../../constants/theme";
import { styles } from "./styles";
import { ButtonProps } from "./types";
import { ButtonStyleName } from "../types";

/**
 * Button - 汎用的なボタンコンポーネント
 *
 * 様々なスタイルとサイズを持ち、アプリケーション内でアクションを実行するために使用します。
 */
const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}` as ButtonStyleName],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : colors.text.white}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}` as ButtonStyleName],
            styles[`text_${size}` as ButtonStyleName],
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
