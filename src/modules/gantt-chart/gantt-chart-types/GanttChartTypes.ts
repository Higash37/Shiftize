// ガントチャート共通型定義

import { ShiftStatus } from "@/common/common-models/ModelIndex";

export interface ShiftStatusConfig {
  status: ShiftStatus;
  label: string;
  color: string;
  canEdit: boolean;
}
