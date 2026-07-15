
import type { ClassTimeSlot } from "@/common/common-models/ModelIndex";

interface TimeSlot {
  type: "user" | "class";

  startTime: string;

  endTime: string;
  typeId?: string | undefined;
  typeName?: string | undefined;
}

interface ShiftWithClasses {
  startTime: string;
  endTime: string;
  classes?: ClassTimeSlot[];
}

export const splitShiftIntoTimeSlots = (shift: ShiftWithClasses): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = new Date(`2000-01-01T${shift.startTime}`);
  const endTime = new Date(`2000-01-01T${shift.endTime}`);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return [];
  }

  let currentTime = startTime;

  const classes =
    shift.classes?.sort((a: ClassTimeSlot, b: ClassTimeSlot) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`);
      const timeB = new Date(`2000-01-01T${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    }) || [];

  classes.forEach((classTime: ClassTimeSlot) => {
    const classStart = new Date(`2000-01-01T${classTime.startTime}`);
    const classEnd = new Date(`2000-01-01T${classTime.endTime}`);

    if (currentTime < classStart) {
      slots.push({
        type: "user",
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: classStart.toTimeString().slice(0, 5),
      });
    }

    slots.push({
      type: "class",
      startTime: classStart.toTimeString().slice(0, 5),
      endTime: classEnd.toTimeString().slice(0, 5),
      typeId: classTime.typeId,
      typeName: classTime.typeName,
    });

    currentTime = classEnd;
  });

  if (currentTime < endTime) {
    slots.push({
      type: "user",
      startTime: currentTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
    });
  }

  return slots;
};
