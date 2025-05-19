export type ShiftStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'deleted'
  | 'completed';

export interface Shift {
  id: string;
  status: ShiftStatus;
  startTime: string;
  endTime: string;
  date: string;
  userId: string;
  notes?: string;
  approvedBy?: string;
  rejectedReason?: string;
}
