import { useShift } from "@/hooks/useShift";

export interface RecurringSettings {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export type ShiftStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "deleted"
  | "completed";

export interface ShiftItem {
  id: string;
  userId: string;
  nickname: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "staff" | "class" | "deleted";
  subject?: string;
  isCompleted: boolean;
  status: ShiftStatus;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
  classes?: Array<{
    startTime: string;
    endTime: string;
  }>;
  requestedChanges?: {
    startTime?: string;
    endTime?: string;
    date?: string;
    type?: "staff" | "class";
    subject?: string;
  };
}

export interface Shift {
  id: string;
  userId: string;
  nickname: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string; // 新しく追加
  subject?: string;
  isCompleted?: boolean;
  status: ShiftStatus;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;
  requestedChanges?: Array<{
    startTime: string;
    endTime: string;
    status: ShiftStatus;
    requestedAt: Date;
  }>;
}
