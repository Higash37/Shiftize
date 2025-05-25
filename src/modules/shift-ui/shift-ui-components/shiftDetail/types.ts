export interface TimeSlot {
  type: "staff" | "class";
  startTime: string;
  endTime: string;
}

export interface ShiftDetailsViewProps {
  timeSlots: TimeSlot[];
}

export interface ShiftTimeSlotProps {
  type: "staff" | "class";
  startTime: string;
  endTime: string;
}
