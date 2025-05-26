import React from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";

// 型定義を追加
interface SkeletonBoxProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => (
  <View
    style={[
      {
        width,
        height,
        borderRadius,
        backgroundColor: "#e0e0e0",
        marginVertical: 8,
      } as ViewStyle,
      style,
    ]}
  />
);

export const YoutubeSkeleton: React.FC = () => (
  <View style={{ padding: 16 }}>
    <SkeletonBox width={"100%"} height={200} borderRadius={12} />
    <SkeletonBox width={"60%"} height={24} />
    <SkeletonBox width={"40%"} height={18} />
    <SkeletonBox width={"80%"} height={18} />
  </View>
);

const styles = StyleSheet.create({});
