import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";

/**
 * スクロールバーを非表示にするカスタムScrollViewコンポーネント
 * アプリ全体で統一的に使用することでスクロールバーを非表示にできます
 */
export const CustomScrollView: React.FC<ScrollViewProps> = (props) => {
  const { children, ...rest } = props;

  return (
    <ScrollView
      {...rest}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

export default CustomScrollView;
