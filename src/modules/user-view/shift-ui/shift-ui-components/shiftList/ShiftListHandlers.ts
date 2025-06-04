import { useRouter } from "expo-router";
import { Shift } from "./types";

export const useShiftHandlers = (
  monthlyShifts: Shift[],
  shiftRefs: { [key: string]: any },
  scrollViewRef: React.RefObject<any>,
  setSelectedDate: (date: string) => void,
  setModalShift: (shift: any) => void,
  setModalVisible: (visible: boolean) => void,
  handleShiftEdit: (shift: any) => void
) => {
  const router = useRouter();

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);

    const selectedShift = monthlyShifts.find(
      (shift) => shift.date === day.dateString
    );
    if (selectedShift && shiftRefs[selectedShift.id]) {
      setTimeout(() => {
        shiftRefs[selectedShift.id]?.measureLayout(
          scrollViewRef.current?._nativeRef,
          (x: number, y: number) => {
            scrollViewRef.current?.scrollTo({ y, animated: true });
          },
          () => {}
        );
      }, 100);
    }
  };

  const handleShiftPress = (shift: any) => {
    if (shift.status === "approved") {
      setModalShift(shift);
      setModalVisible(true);
    } else {
      handleShiftEdit(shift);
    }
  };

  return { handleDayPress, handleShiftPress };
};
