import { supabase } from "@/integrations/supabase/client";

import {
  toDateKey,
  type Appointment,
  type BlockedSlot,
  type UnavailableSlot,
} from "./atelier";

export async function fetchUnavailableSlots(from: Date, to: Date): Promise<UnavailableSlot[]> {
  const { data, error } = await supabase.rpc("get_unavailable_slots", {
    p_from: toDateKey(from),
    p_to: toDateKey(to),
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as UnavailableSlot[];
}

export interface BookingInput {
  name: string;
  phone: string;
  email: string;
  date: Date;
  timeSlot: string;
  pronouns: string;
}

export interface AppointmentHold {
  id: string;
  holdSecret: string;
}

export async function holdAppointment(input: BookingInput): Promise<AppointmentHold> {
  const { data, error } = await supabase.rpc("create_pending_appointment", {
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
    p_date: toDateKey(input.date),
    p_time_slot: input.timeSlot,
    p_pronouns: input.pronouns,
  });
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row?.id || !row.hold_secret) throw new Error("Could not hold that slot. Please try again.");
  return { id: row.id, holdSecret: row.hold_secret };
}

/** Proof-of-concept: locks in a held slot with no payment ($0). */
export async function confirmFreeHold(id: string, holdSecret: string): Promise<void> {
  const { error } = await supabase.rpc("confirm_free_hold", { p_id: id, p_secret: holdSecret });
  if (error) throw new Error(error.message);
}

export async function releaseAppointment(id: string): Promise<void> {
  const { error } = await supabase.rpc("release_pending_appointment", { p_id: id });
  if (error) throw new Error(error.message);
}

export async function getBookingStatus(id: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_booking_status", { p_id: id });
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}

export async function fetchConfirmedBooking(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase.rpc("get_confirmed_booking", { p_id: id });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Omit<Appointment, "notes">>;
  const row = rows[0];
  if (!row) return null;
  return { ...row, notes: null } as Appointment;
}

export async function fetchBookingToken(id: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_booking_token", { p_id: id });
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}

export async function fetchBookingByToken(token: string): Promise<Appointment | null> {
  const { data, error } = await supabase.rpc("get_booking_by_token", { p_token: token });
  if (error) throw new Error(error.message);
  const row = (data ?? [])[0];
  if (!row) return null;
  return { ...row, notes: null } as Appointment;
}

export interface AttendanceState {
  reminder_sent_at: string | null;
  client_confirmed_at: string | null;
}

export async function fetchAttendanceState(token: string): Promise<AttendanceState | null> {
  const { data, error } = await supabase.rpc("get_booking_confirmation", { p_token: token });
  if (error) throw new Error(error.message);
  return (data ?? [])[0] ?? null;
}

export async function confirmAttendance(token: string): Promise<string> {
  const { data, error } = await supabase.rpc("confirm_attendance", { p_token: token });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function rescheduleBooking(token: string, date: Date, timeSlot: string): Promise<void> {
  const { error } = await supabase.rpc("reschedule_booking", {
    p_token: token,
    p_date: toDateKey(date),
    p_time_slot: timeSlot,
  });
  if (error) throw new Error(error.message);
}


export async function fetchAppointments(from: Date, to: Date): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .gte("booking_date", toDateKey(from))
    .lte("booking_date", toDateKey(to))
    .order("booking_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export type BookingPeriod = "upcoming" | "past" | "all";

export interface BookingListOptions {
  period: BookingPeriod;
  status: string;
  search: string;
  page: number;
  pageSize: number;
  today: string;
}

export async function fetchBookingPage(options: BookingListOptions): Promise<{ bookings: Appointment[]; total: number }> {
  const { period, status, search, page, pageSize, today } = options;
  const ascending = period === "upcoming";
  const fields = "id,client_name,phone,email,booking_date,time_slot,status,payment_status,pronouns,created_at,reschedule_count,rescheduled_at,idea_description,reference_image_path,concept_sketch_path,notes,source";
  let query = supabase.from("appointments").select(fields, { count: "exact" });
  if (period === "upcoming") query = query.gte("booking_date", today);
  if (period === "past") query = query.lt("booking_date", today);
  if (status !== "all") query = query.eq("status", status);
  const term = search.trim();
  if (term) query = query.ilike("client_name", `%${term.replace(/[\\%_]/g, "\\$&")}%`);
  const start = page * pageSize;
  const { data, count, error } = await query
    .order("booking_date", { ascending })
    .order("time_slot", { ascending })
    .range(start, start + pageSize - 1);
  if (error) throw new Error(error.message);
  return { bookings: (data ?? []) as Appointment[], total: count ?? 0 };
}

export async function fetchAdminBooking(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase.from("appointments")
    .select("id,client_name,phone,email,booking_date,time_slot,status,payment_status,pronouns,created_at,reschedule_count,rescheduled_at,idea_description,reference_image_path,concept_sketch_path,notes,reminder_sent_at,client_confirmed_at,day_of_sent_at,aftercare_sent_at,social_sent_at,sms_reminder_status,sms_reminder_at")
    .eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Appointment | null;
}

export async function fetchBlockedSlots(from: Date, to: Date): Promise<BlockedSlot[]> {
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .gte("blocked_date", toDateKey(from))
    .lte("blocked_date", toDateKey(to));
  if (error) throw new Error(error.message);
  return (data ?? []) as BlockedSlot[];
}

export async function setAppointmentStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function blockSlot(date: Date, timeSlot: string | null, reason: string | null): Promise<void> {
  const { error } = await supabase
    .from("blocked_slots")
    .insert({ blocked_date: toDateKey(date), time_slot: timeSlot, reason });
  if (error) throw new Error(error.message);
}

export async function unblockSlot(id: string): Promise<void> {
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function claimAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("claim_admin");
  if (error) throw new Error(error.message);
  return data === true;
}

export async function signIdeaImage(path: string): Promise<string | null> {
  if (path.includes('..')) {
    throw new Error('Invalid path');
  }
  const { data } = await supabase.storage.from("tattoo-ideas").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export interface ReminderRun {
  ran_at: string;
  skipped_reason: string | null;
  sent: number;
  failed: number;
  sms_simulated: number;
}

/** Latest automatic reminder run that actually processed bookings (not a skip). */
export async function getLastReminderRun(): Promise<{ last: ReminderRun | null; lastPing: string | null }> {
  const [processed, ping] = await Promise.all([
    supabase.from("reminder_runs").select("ran_at,skipped_reason,sent,failed,sms_simulated").is("skipped_reason", null).order("ran_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("reminder_runs").select("ran_at").order("ran_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { last: processed.data ?? null, lastPing: ping.data?.ran_at ?? null };
}
