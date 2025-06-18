import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ShiftCreateForm } from "@/modules/user-view/shift-ui-components/shiftCreate/ShiftCreateForm";
import { colors } from "@/common/common-constants/ThemeConstants";
import Header from "@/common/common-ui/ui-layout/LayoutHeader";

export default function ShiftCreateScreen() {
  const {
    mode = "create",
    shiftId = "",
    date,
    startTime,
    endTime,
    classes,
  } = useLocalSearchParams();

  return (
    <>
      <View style={styles.container}>
        <ShiftCreateForm
          initialMode={mode as string}
          initialShiftId={shiftId as string}
          initialDate={date as string}
          initialStartTime={startTime as string}
          initialEndTime={endTime as string}
          initialClasses={classes as string}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
