
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

export const SUB_HEADER_HEIGHT = 44;

interface DateNavigatorProps {

  label: string;

  onPrev: () => void;

  onNext: () => void;

  onLabelPress?: () => void;

  trailing?: React.ReactNode;
}

export const DateNavigator: React.FC<DateNavigatorProps> = React.memo(
  ({ label, onPrev, onNext, onLabelPress, trailing }) => {
    const { colorScheme: cs } = useMD3Theme();

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: SUB_HEADER_HEIGHT,
        }}
      >
        <TouchableOpacity
          style={{ paddingHorizontal: 10, justifyContent: "center", height: SUB_HEADER_HEIGHT }}
          onPress={onPrev}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: cs.primary }}>
            ＜
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLabelPress}
          disabled={!onLabelPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 4,
            height: SUB_HEADER_HEIGHT,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "bold", color: cs.onSurface }}>
            {label}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingHorizontal: 10, justifyContent: "center", height: SUB_HEADER_HEIGHT }}
          onPress={onNext}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: cs.primary }}>
            ＞
          </Text>
        </TouchableOpacity>

        {trailing}
      </View>
    );
  }
);
