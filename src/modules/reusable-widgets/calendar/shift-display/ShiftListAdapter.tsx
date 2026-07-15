

import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { ShiftDetails } from "./ShiftDetails";
import { ShiftAdapterProps } from "../calendar-types/shift.types";

export const ShiftDetailsAdapter = memo<ShiftAdapterProps>(
  ({ shift, isOpen }) => {

    if (!isOpen) {
      return null;
    }

    return (
      <View style={styles.detailsContainer}>
        {}
        <ShiftDetails shift={shift} isOpen={true} maxHeight={150} />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  detailsContainer: {
    marginHorizontal: 5,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
});
