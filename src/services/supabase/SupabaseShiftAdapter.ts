

import type { IShiftService } from "../interfaces/IShiftService";
import type { Shift, ShiftItem, ShiftType, ShiftStatus, ClassTimeSlot } from "@/common/common-models/ModelIndex";
import type { ShiftHistoryActor } from "@/services/shift-history/shiftHistoryLogger";
import { getSupabase } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  logShiftChange,
  determineActionType,
} from "@/services/shift-history/shiftHistoryLogger";

interface ShiftRow {
  id: string;
  user_id?: string;
  store_id?: string;
  nickname?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  type?: ShiftType;
  subject?: string;
  notes?: string;
  is_completed?: boolean;
  status?: ShiftStatus;
  duration?: number;
  created_at?: string;
  updated_at?: string;
  classes?: ClassTimeSlot[];
  requested_changes?: Shift["requestedChanges"] | null;
  approved_by?: string;
  rejected_reason?: string;
}

let channelCounter = 0;

const validateStoreId = (storeId: string): void => {
  if (!storeId || !/^[a-zA-Z0-9_-]+$/.test(storeId)) {
    throw new Error(`不正な店舗IDです: store_id に使用できない文字が含まれています`);
  }
};

const validateRealtimeParams = (storeId: string, year?: number, month?: number): void => {
  validateStoreId(storeId);
  if (year !== undefined && (!Number.isInteger(year) || year < 2000 || year > 2100)) {
    throw new Error(`不正な年パラメータです: ${year}`);
  }
  if (month !== undefined && (!Number.isInteger(month) || month < 0 || month > 11)) {
    throw new Error(`不正な月パラメータです: ${month}`);
  }
};

const SHIFT_ITEM_COLUMNS = "id,user_id,store_id,nickname,date,start_time,end_time,type,subject,notes,is_completed,status,duration,created_at,updated_at,classes,requested_changes" as const;

const REALTIME_DEBOUNCE_MS = 300;

const toShiftItemFromRow = (row: ShiftRow): ShiftItem => {
  const item: ShiftItem = {
    id: row.id,
    userId: row.user_id || "",
    storeId: row.store_id || "",
    nickname: row.nickname || "",
    date: row.date || "",
    startTime: row.start_time || "",
    endTime: row.end_time || "",
    type: row.type || "user",
    isCompleted: row.is_completed || false,
    status: row.status || "draft",
    duration: String(row.duration ?? ""),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
  if (row.subject != null) item.subject = row.subject;
  if (row.notes != null) item.notes = row.notes;
  if (row.classes) item.classes = row.classes;
  const firstChange = row.requested_changes?.[0];
  if (firstChange) item.requestedChanges = { startTime: firstChange.startTime, endTime: firstChange.endTime };
  return item;
};

const toShiftFromRow = (row: ShiftRow): Shift => {
  const shift: Shift = {
    id: row.id,
    userId: row.user_id || "",
    storeId: row.store_id || "",
    date: row.date || "",
    startTime: row.start_time || "",
    endTime: row.end_time || "",
    status: row.status || "draft",
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
  if (row.nickname != null) shift.nickname = row.nickname;
  if (row.type) shift.type = row.type;
  if (row.subject != null) shift.subject = row.subject;
  if (row.notes != null) shift.notes = row.notes;
  if (row.is_completed != null) shift.isCompleted = row.is_completed;
  if (row.duration != null) shift.duration = row.duration;
  if (row.classes) shift.classes = row.classes;
  if (row.requested_changes) shift.requestedChanges = row.requested_changes;
  return shift;
};

const toInsertRow = (shift: Omit<Shift, "id"> & { id?: string }) => {
  const row: Record<string, unknown> = {
    user_id: shift.userId,
    store_id: shift.storeId,
    nickname: shift.nickname,
    date: shift.date,
    start_time: shift.startTime,
    end_time: shift.endTime,
    type: shift.type || "user",
    status: shift.status || "draft",
    duration: shift.duration,
    is_completed: shift.isCompleted,
    subject: shift.subject,
    notes: shift.notes,
    classes: shift.classes || [],
    requested_changes: shift.requestedChanges || null,
  };
  if (shift.id) row['id'] = shift.id;
  return row;
};

const toUpdateRow = (shift: Partial<Shift>) => {
  const row: Record<string, unknown> = {};
  if (shift.userId !== undefined) row['user_id'] = shift.userId;
  if (shift.storeId !== undefined) row['store_id'] = shift.storeId;
  if (shift.nickname !== undefined) row['nickname'] = shift.nickname;
  if (shift.date !== undefined) row['date'] = shift.date;
  if (shift.startTime !== undefined) row['start_time'] = shift.startTime;
  if (shift.endTime !== undefined) row['end_time'] = shift.endTime;
  if (shift.type !== undefined) row['type'] = shift.type;
  if (shift.status !== undefined) row['status'] = shift.status;
  if (shift.duration !== undefined) row['duration'] = shift.duration;
  if (shift.isCompleted !== undefined) row['is_completed'] = shift.isCompleted;
  if (shift.subject !== undefined) row['subject'] = shift.subject;
  if (shift.notes !== undefined) row['notes'] = shift.notes;
  if (shift.classes !== undefined) row['classes'] = shift.classes;
  if (shift.requestedChanges !== undefined) row['requested_changes'] = shift.requestedChanges;
  if (shift.approvedBy !== undefined) row['approved_by'] = shift.approvedBy;
  if (shift.rejectedReason !== undefined) row['rejected_reason'] = shift.rejectedReason;
  return row;
};

const shiftToShiftItem = (shift: Shift & { id: string }): ShiftItem => {
  const item: ShiftItem = {
    id: shift.id,
    userId: shift.userId || "",
    storeId: shift.storeId || "",
    nickname: shift.nickname || "",
    date: shift.date || "",
    startTime: shift.startTime || "",
    endTime: shift.endTime || "",
    type: shift.type || "user",
    isCompleted: shift.isCompleted || false,
    status: shift.status || "draft",
    duration: String(shift.duration || ""),
    createdAt: shift.createdAt || new Date(),
    updatedAt: shift.updatedAt || new Date(),
  };
  if (shift.subject !== undefined) item.subject = shift.subject;
  if (shift.notes !== undefined) item.notes = shift.notes;
  if (shift.classes !== undefined) item.classes = shift.classes;
  const firstChange =
    shift.requestedChanges && Array.isArray(shift.requestedChanges) && shift.requestedChanges.length > 0
      ? shift.requestedChanges[0]
      : null;
  if (firstChange) {
    item.requestedChanges = { startTime: firstChange.startTime, endTime: firstChange.endTime };
  }
  return item;
};

const mergeShiftForLogging = (
  id: string,
  prevData: Shift | null | undefined,
  updates: Partial<Shift> | null | undefined
): { prev: ShiftItem | null; next: ShiftItem | null } => {
  const prev = prevData ? shiftToShiftItem({ ...prevData, id }) : null;
  if (!updates) return { prev, next: prev };
  const base: Partial<Shift> = prevData || {};
  const merged = shiftToShiftItem({ ...base, ...updates, id } as Shift & { id: string });
  return { prev, next: merged };
};

const recordAuditLog = async (
  actor: ShiftHistoryActor,
  prev: ShiftItem | null,
  next: ShiftItem | null,
) => {
  const storeId = next?.storeId || prev?.storeId || "";
  const action = determineActionType(prev, next, actor);
  await logShiftChange(action, actor, storeId, next, prev);
};

export class SupabaseShiftAdapter implements IShiftService {
  private async fetchShiftById(id: string): Promise<Shift | null> {
    const supabase = getSupabase();
    const { data } = await supabase.from("shifts").select("*").eq("id", id).single();
    return data ? toShiftFromRow(data) : null;
  }

  async getShift(id: string): Promise<Shift | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return toShiftFromRow(data);
  }

  async getShifts(storeId?: string): Promise<Shift[]> {
    const supabase = getSupabase();
    let query = supabase.from("shifts").select("*");

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftFromRow);
  }

  async addShift(
    shift: Omit<Shift, "id">,
    actor?: ShiftHistoryActor
  ): Promise<string> {
    const supabase = getSupabase();
    const row = toInsertRow(shift);

    const { data, error } = await supabase
      .from("shifts")
      .insert(row)
      .select("id")
      .single();

    if (error) throw error;
    const shiftId = data.id;

    if (actor) {
      const next = shiftToShiftItem({
        ...shift, id: shiftId,
        status: shift.status || "draft",
        createdAt: new Date(), updatedAt: new Date(),
      });
      await recordAuditLog(actor, null, next);
    }

    return shiftId;
  }

  async updateShift(
    id: string,
    shift: Partial<Shift>,
    actor?: ShiftHistoryActor
  ): Promise<void> {
    const supabase = getSupabase();

    const previousData = await this.fetchShiftById(id);

    const row = toUpdateRow(shift);
    const { error } = await supabase.from("shifts").update(row).eq("id", id);
    if (error) throw error;

    if (actor && previousData) {
      const { prev, next } = mergeShiftForLogging(id, previousData, {
        ...shift, updatedAt: new Date(),
      });
      if (next) {
        await recordAuditLog(actor, prev, next);
      }
    }
  }

  async markShiftAsDeleted(
    id: string,
    deletedBy?: ShiftHistoryActor,
    _reason?: string
  ): Promise<void> {
    const supabase = getSupabase();

    const shiftData = await this.fetchShiftById(id);

    const { error } = await supabase.from("shifts").delete().eq("id", id);
    if (error) throw error;

    if (deletedBy && shiftData) {
      const prev = shiftToShiftItem({ ...shiftData, id });
      await recordAuditLog(deletedBy, prev, null);
    }
  }

  async approveShiftChanges(
    id: string,
    approver?: ShiftHistoryActor
  ): Promise<void> {

    const shiftData = await this.fetchShiftById(id);
    if (!shiftData) return;

    const isPending = shiftData.status === "pending";
    const hasRequestedChanges = shiftData.requestedChanges;
    if (!isPending && !hasRequestedChanges) return;

    await this.applyApproval(id, shiftData);

    if (approver) {
      const updates = this.buildApprovalUpdates(shiftData);
      const { prev, next } = mergeShiftForLogging(id, shiftData, updates);
      if (next) {
        await recordAuditLog(approver, prev, next);
      }
    }
  }

  private async applyApproval(id: string, shiftData: Shift): Promise<void> {
    const supabase = getSupabase();
    const hasRequestedChanges = shiftData.requestedChanges;

    if (!hasRequestedChanges) {

      const { error } = await supabase
        .from("shifts")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
      return;
    }

    const changes = Array.isArray(hasRequestedChanges)
      ? hasRequestedChanges[0]
      : hasRequestedChanges;

    if (!changes) {
      const { error } = await supabase
        .from("shifts")
        .update({ status: "approved", requested_changes: null })
        .eq("id", id);
      if (error) throw error;
      return;
    }

    const updateData: Record<string, unknown> = {
      status: "approved",
      requested_changes: null,
    };
    if (changes.startTime) updateData['start_time'] = changes.startTime;
    if (changes.endTime) updateData['end_time'] = changes.endTime;
    if (changes.date) updateData['date'] = changes.date;
    if (changes.type) updateData['type'] = changes.type;
    if (changes.subject) updateData['subject'] = changes.subject;

    const { error } = await supabase
      .from("shifts")
      .update(updateData)
      .eq("id", id);
    if (error) throw error;
  }

  private buildApprovalUpdates(shiftData: Shift): Partial<Shift> {
    const hasRequestedChanges = shiftData.requestedChanges;
    if (!hasRequestedChanges) {
      return { status: "approved", updatedAt: new Date() };
    }

    const changes = Array.isArray(hasRequestedChanges)
      ? hasRequestedChanges[0]
      : hasRequestedChanges;

    if (!changes) {
      return { status: "approved", updatedAt: new Date() };
    }

    const updates: Partial<Shift> = {
      ...changes,
      status: "approved",
      updatedAt: new Date(),
    };
    delete updates.requestedChanges;
    return updates;
  }

  async markShiftAsCompleted(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("shifts")
      .update({ status: "completed" })
      .eq("id", id);
    if (error) throw error;
  }

  async addShiftReport(
    shiftId: string,
    reportData: {
      taskCounts: Record<string, { count: number; time: number }>;
      comments: string;
    }
  ): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from("reports").insert({
      shift_id: shiftId,
      task_counts: reportData.taskCounts,
      comments: reportData.comments,
    });
    if (error) throw error;
  }

  async getShiftItems(storeId: string): Promise<ShiftItem[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("shifts")
      .select(SHIFT_ITEM_COLUMNS)
      .eq("store_id", storeId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftItemFromRow);
  }

  onShiftsChanged(
    storeId: string,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {

    validateRealtimeParams(storeId);

    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    const fetchAsShiftItems = async (): Promise<ShiftItem[]> => {

      const { data, error } = await supabase
        .from("shifts")
        .select(SHIFT_ITEM_COLUMNS)
        .eq("store_id", storeId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data || []).map(toShiftItemFromRow);
    };

    let aborted = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const debouncedFetch = () => {
      if (aborted) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (aborted) return;
        fetchAsShiftItems()
          .then((items) => { if (!aborted) callback(items); })
          .catch((err) => { if (!aborted) onError?.(err); });
      }, REALTIME_DEBOUNCE_MS);
    };

    fetchAsShiftItems()
      .then((items) => { if (!aborted) callback(items); })
      .catch((err) => { if (!aborted) onError?.(err); });

    channel = supabase
      .channel(`shifts-${storeId}-${++channelCounter}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `store_id=eq.${storeId}`,
        },
        debouncedFetch
      )
      .subscribe();

    return () => {
      aborted = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }

  async getShiftsByMonth(
    storeId: string,
    year: number,
    month: number
  ): Promise<ShiftItem[]> {
    const supabase = getSupabase();
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    const { data, error } = await supabase
      .from("shifts")
      .select(SHIFT_ITEM_COLUMNS)
      .eq("store_id", storeId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(toShiftItemFromRow);
  }

  onShiftsByMonth(
    storeId: string,
    year: number,
    month: number,
    callback: (shifts: ShiftItem[]) => void,
    onError?: (error: Error) => void
  ): () => void {

    validateRealtimeParams(storeId, year, month);

    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-31`;

    const fetchMonthShifts = async () => {

      const { data, error } = await supabase
        .from("shifts")
        .select(SHIFT_ITEM_COLUMNS)
        .eq("store_id", storeId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data || []).map(toShiftItemFromRow);
    };

    let aborted = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const debouncedFetch = () => {
      if (aborted) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (aborted) return;
        fetchMonthShifts()
          .then((items) => { if (!aborted) callback(items); })
          .catch((err) => { if (!aborted) onError?.(err); });
      }, REALTIME_DEBOUNCE_MS);
    };

    fetchMonthShifts()
      .then((items) => { if (!aborted) callback(items); })
      .catch((err) => { if (!aborted) onError?.(err); });

    channel = supabase
      .channel(`shifts-month-${storeId}-${year}-${month}-${++channelCounter}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shifts",
          filter: `store_id=eq.${storeId}`,
        },
        debouncedFetch
      )
      .subscribe();

    return () => {
      aborted = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
    };
  }
}
