

export type ShiftStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "deletion_requested"
  | "deleted"
  | "completed"
  | "purged"
  | "recruitment";

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
    color: "#FFD700",
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
  {
    status: "completed",
    label: "完了",
    color: "#4CAF50",
    canEdit: false,
    description: "完了したシフト",
  },
  {
    status: "draft",
    label: "下書き",
    color: "#e0e0e0",
    canEdit: true,
    description: "下書き状態のシフト",
  },
  {
    status: "recruitment",
    label: "募集中",
    color: "#9e9e9e",
    canEdit: false,
    description: "募集中のシフト",
  },
];

export type ShiftType = "user" | "class" | "staff" | "deleted" | "recruitment";

export interface BaseShift {

  id: string;

  userId: string;

  storeId: string;

  date: string;

  startTime: string;

  endTime: string;

  status: ShiftStatus;
}

export interface Shift extends BaseShift {

  nickname?: string;

  type?: ShiftType;

  subject?: string;

  notes?: string;

  approvedBy?: string;

  rejectedReason?: string;

  isCompleted?: boolean;

  createdAt?: Date;

  updatedAt?: Date;

  duration?: number;

  classes?: Array<ClassTimeSlot>;

  requestedChanges?: Array<{
    startTime: string;
    endTime: string;
    status: ShiftStatus;
    requestedAt: Date;
    date?: string;
    type?: ShiftType;
    subject?: string;
  }>;
}

export type TimeSlot = {

  start: string;

  end: string;
};

export type ClassTimeSlot = {

  startTime: string;

  endTime: string;

  id?: string;

  typeId?: string;

  typeName?: string;
};

export type WageMode = "exclude" | "include" | "custom_rate";

export interface TimeSegmentType {

  id: string;

  storeId: string;

  name: string;

  icon: string;

  color: string;

  wageMode: WageMode;

  customRate: number;

  sortOrder: number;
}

export interface RecurringSettings {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface ShiftData {

  id: string;

  userName: string;

  startTime: string;

  endTime: string;

  color?: string;

  status: ShiftStatus;
}

export interface ShiftRequestedChanges {
  startTime?: string;
  endTime?: string;
  date?: string;
  type?: ShiftType;
  subject?: string;
}

export interface ShiftItem {
  id: string;
  userId: string;
  storeId: string;
  nickname: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  subject?: string;
  notes?: string;
  isCompleted: boolean;
  status: ShiftStatus;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
  classes?: Array<ClassTimeSlot>;
  requestedChanges?: ShiftRequestedChanges;
}

export interface RecruitmentShift {

  id: string;

  storeId: string;

  date: string;

  startTime: string;

  endTime: string;

  subject?: string;

  notes?: string;

  createdBy: string;

  createdAt: Date;

  updatedAt: Date;

  maxApplicants?: number;

  applications: RecruitmentApplication[];

  status: "open" | "closed" | "cancelled";

  deadline?: Date;
}

export interface RecruitmentApplication {

  userId: string;

  nickname: string;

  requestedStartTime: string;

  requestedEndTime: string;

  appliedAt: Date;

  status: "pending" | "approved" | "rejected";

  notes?: string;
}

