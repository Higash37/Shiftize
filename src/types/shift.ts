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
  | "pending"
  | "approved"
  | "rejected"
  | "deletion_requested"
  | "deleted";

export interface ShiftStatusConfig {
  status: ShiftStatus;
  label: string;
  color: string;
  canEdit: boolean;
  description: string;
}

export const DEFAULT_SHIFT_STATUS_CONFIG: ShiftStatusConfig[] = [
  {
    status: "pending",
    label: "申請中",
    color: "#FFD700",
    canEdit: true,
    description: "新規申請されたシフト",
  },
  {
    status: "approved",
    label: "承認済み",
    color: "#90caf9",
    canEdit: false,
    description: "承認されたシフト",
  },
  {
    status: "rejected",
    label: "却下",
    color: "#ffcdd2",
    canEdit: true,
    description: "却下されたシフト",
  },
  {
    status: "deletion_requested",
    label: "削除申請中",
    color: "#FFA500",
    canEdit: false,
    description: "削除申請中のシフト",
  },
  {
    status: "deleted",
    label: "削除済み",
    color: "#9e9e9e",
    canEdit: false,
    description: "削除されたシフト",
  },
];

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
