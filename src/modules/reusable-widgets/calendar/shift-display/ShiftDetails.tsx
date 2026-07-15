

import React, { useRef } from "react";
import { View, Text, Animated } from "react-native";

import { format } from "date-fns";

import { ja } from "date-fns/locale";
import { createShiftDetailsStyles } from "./ShiftDetails.styles";
import { ShiftDetailsProps } from "./ShiftDetails.types";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";

import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";

import { parseTimeString } from "../calendar-utils/shift.utils";

export const ShiftDetails: React.FC<ShiftDetailsProps> = ({
  shift,
  maxHeight = 500,
  isOpen,
}) => {

  const styles = useThemedStyles(createShiftDetailsStyles);

  const { typesMap } = useTimeSegmentTypesContext();

  const heightAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isOpen ? maxHeight : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, maxHeight]);

  return (

    <Animated.View style={[styles.container, { maxHeight: heightAnim }]}>
      {}
      <View style={styles.header}>
        <Text style={styles.nickname}>{shift.nickname}</Text>
        <Text style={styles.date}>
          {}
          {format(new Date(shift.date), "M月d日(E)", { locale: ja })}
        </Text>
      </View>

      {}
      <View style={styles.timeSlots}>
        {}
        {}
        {shift.classes?.length ? (

          <>
            {}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>
              <Text style={styles.timeText}>
                {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}
                {" ~ "}
                {format(
                  parseTimeString(shift.date, shift.classes[0]?.startTime || "09:00"),
                  "HH:mm"
                )}
              </Text>
            </View>

            {}
            {shift.classes.map(
              (

                classTime: { startTime: string; endTime: string; typeId?: string; typeName?: string },
                index: number
              ) => {

                const defaultType = Object.values(typesMap).find((t) => t.name === "授業");

                const segType = classTime.typeId ? typesMap[classTime.typeId] : defaultType;

                const displayName = segType?.name || classTime.typeName || "授業";
                const displayIcon = segType?.icon || "";
                const displayColor = segType?.color;

                return (

                  <React.Fragment key={index}>
                    {}
                    <View style={[
                      styles.timeSlot,
                      styles.classTimeSlot,

                      displayColor ? { backgroundColor: displayColor + "18" } : undefined
                    ]}>
                      <Text style={[
                        styles.timeSlotLabel,
                        styles.classLabel,
                        displayColor ? { color: displayColor } : undefined
                      ]}>
                        {}
                        {displayIcon ? `${displayIcon} ${displayName}` : displayName}
                      </Text>
                      <Text style={[styles.timeText, styles.classTime]}>
                        {format(
                          parseTimeString(shift.date, classTime.startTime),
                          "HH:mm"
                        )}
                        {" ~ "}
                        {format(
                          parseTimeString(shift.date, classTime.endTime),
                          "HH:mm"
                        )}
                      </Text>
                    </View>

                    {}
                    {}
                    {shift.classes?.[index + 1] && (
                      <View style={styles.timeSlot}>
                        <Text style={styles.timeSlotLabel}>スタッフ</Text>
                        <Text style={styles.timeText}>
                          {format(
                            parseTimeString(shift.date, classTime.endTime),
                            "HH:mm"
                          )}
                          {" ~ "}
                          {format(
                            parseTimeString(
                              shift.date,
                              shift.classes[index + 1]?.startTime || "10:00"
                            ),
                            "HH:mm"
                          )}
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                );
              }
            )}

            {}
            <View style={styles.timeSlot}>
              <Text style={styles.timeSlotLabel}>スタッフ</Text>
              <Text style={styles.timeText}>
                {format(
                  parseTimeString(
                    shift.date,

                    shift.classes.at(-1)?.endTime || "22:00"
                  ),
                  "HH:mm"
                )}
                {" ~ "}
                {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
              </Text>
            </View>
          </>
        ) : (

          <View style={styles.timeSlot}>
            <Text style={styles.timeSlotLabel}>スタッフ</Text>
            <Text style={styles.timeText}>
              {format(parseTimeString(shift.date, shift.startTime), "HH:mm")}
              {" ~ "}
              {format(parseTimeString(shift.date, shift.endTime), "HH:mm")}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
