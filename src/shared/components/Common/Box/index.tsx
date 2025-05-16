import React from "react";
import { View } from "react-native";
import { BoxProps } from "./types";
import { styles } from "./styles";
import { shadows } from "../../../constants/theme";
import { BoxStyleName, Variant } from "../types";

/**
 * Box - 汎用的なコンテナコンポーネント
 *
 * 様々なスタイルバリエーションを持ち、コンテンツを囲むための基本的な要素として使用できます。
 */
const Box: React.FC<BoxProps> = ({
  variant = "default",
  padding = "medium",
  margin = "none",
  shadow = "none",
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant as BoxStyleName],
        styles[`padding_${padding}` as BoxStyleName],
        styles[`margin_${margin}` as BoxStyleName],
        shadow !== "none" && shadows[shadow],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export default Box;
