/**
 * Dues Module Types
 * 
 * Type definitions for Sabeel, FMB Hub, Khumus, Zakat, and payment tracking
 */

export type CalendarType = 'hijri' | 'gregorian';
export type ReminderType = 'before_7_days' | 'last_day' | 'custom';
export type CalculationType = 'fixed' | 'percentage';
export type ZakatCalculationType = 'fixed' | 'nisab_based';
export type DueType = 'sabeel' | 'fmb' | 'khumus' | 'zakat';

// Base interface for common fields
interface BaseEntity {
  id: string;
  calendar_type: CalendarType;
  reminder_type: ReminderType;
  reminder_day?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Date range fields shared by multiple entities
interface DateRange {
  start_month: number;
  start_year: number;
  end_month?: number | null;
  end_year?: number | null;
}

// Sabeel - Main family unit
export interface Sabeel extends BaseEntity, DateRange {
  user_id: string;
  sabeel_name: string;
  monthly_amount: number;
  // Relations (loaded separately)
  fmb_hub?: FMBHub | null;
  khumus_list?: Khumus[];
  zakats?: Zakat[];
}

export interface SabeelInput {
  sabeel_name: string;
  monthly_amount: number;
  calendar_type: CalendarType;
  start_month: number;
  start_year: number;
  end_month?: number | null;
  end_year?: number | null;
  reminder_type: ReminderType;
  reminder_day?: number | null;
  is_active?: boolean;
}

// FMB Hub - Community kitchen contribution (one per Sabeel)
export interface FMBHub extends BaseEntity, DateRange {
  sabeel_id: string;
  monthly_amount: number;
}

export interface FMBHubInput {
  sabeel_id: string;
  monthly_amount: number;
  calendar_type: CalendarType;
  start_month: number;
  start_year: number;
  end_month?: number | null;
  end_year?: number | null;
  reminder_type: ReminderType;
  reminder_day?: number | null;
  is_active?: boolean;
}

// Khumus - Individual religious obligation (multiple per Sabeel)
export interface Khumus extends BaseEntity {
  sabeel_id: string;
  person_name: string;
  calculation_type: CalculationType;
  fixed_amount?: number | null;
  monthly_income?: number | null;
  percentage_rate: number;
}

export interface KhumusInput {
  sabeel_id: string;
  person_name: string;
  calculation_type: CalculationType;
  fixed_amount?: number | null;
  monthly_income?: number | null;
  percentage_rate?: number;
  calendar_type: CalendarType;
  reminder_type: ReminderType;
  reminder_day?: number | null;
  is_active?: boolean;
}

// Zakat - Individual wealth tax (multiple per Sabeel)
export interface Zakat extends BaseEntity {
  sabeel_id: string;
  person_name: string;
  calculation_type: ZakatCalculationType;
  fixed_amount?: number | null;
  assets_value?: number | null;
  nisab_threshold?: number | null;
  zakat_rate: number;
}

export interface ZakatInput {
  sabeel_id: string;
  person_name: string;
  calculation_type: ZakatCalculationType;
  fixed_amount?: number | null;
  assets_value?: number | null;
  nisab_threshold?: number | null;
  zakat_rate?: number;
  calendar_type: CalendarType;
  reminder_type: ReminderType;
  reminder_day?: number | null;
  is_active?: boolean;
}

// Due Payment - Payment tracking
export interface DuePayment {
  id: string;
  user_id: string;
  due_type: DueType;
  reference_id: string;
  calendar_type: CalendarType;
  due_month: number;
  due_year: number;
  amount_due: number;
  amount_paid: number;
  paid_at?: string | null;
  created_at: string;
}

export interface DuePaymentInput {
  due_type: DueType;
  reference_id: string;
  calendar_type: CalendarType;
  due_month: number;
  due_year: number;
  amount_due: number;
  amount_paid?: number;
  paid_at?: string | null;
}

// Reminder types for dashboard display
export type ReminderUrgency = 'upcoming' | 'due_today' | 'overdue';

export interface DueReminder {
  id: string;
  type: DueType;
  title: string;
  subtitle?: string;
  amount: number;
  calendarType: CalendarType;
  dueDate: string; // Formatted based on calendar type
  daysRemaining: number;
  urgency: ReminderUrgency;
  sabeelId: string;
  sabeelName: string;
}

// Full Sabeel with nested relations for display
export interface SabeelWithRelations extends Sabeel {
  fmb_hub: FMBHub | null;
  khumus_list: Khumus[];
  zakats: Zakat[];
}

// Helper to calculate Khumus amount
export function calculateKhumusAmount(khumus: Khumus): number {
  if (khumus.calculation_type === 'fixed') {
    return khumus.fixed_amount || 0;
  }
  return ((khumus.monthly_income || 0) * (khumus.percentage_rate || 20)) / 100;
}

// Helper to calculate Zakat amount
export function calculateZakatAmount(zakat: Zakat): number {
  if (zakat.calculation_type === 'fixed') {
    return zakat.fixed_amount || 0;
  }
  const assets = zakat.assets_value || 0;
  const nisab = zakat.nisab_threshold || 0;
  if (assets >= nisab) {
    return (assets * (zakat.zakat_rate || 2.5)) / 100;
  }
  return 0;
}
