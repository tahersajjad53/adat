// Goals feature type definitions

export type RecurrenceType = 'daily' | 'weekly' | 'custom' | 'one-time';

export interface RecurrencePattern {
  type: 'interval' | 'monthly';
  interval?: number;           // Every N days/weeks
  intervalUnit?: 'days' | 'weeks';
  monthlyDay?: number;         // Day of month (1-30)
  calendarType?: 'hijri' | 'gregorian';
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  recurrence_type: RecurrenceType;
  recurrence_pattern?: RecurrencePattern | null;
  recurrence_days?: number[] | null; // 0=Sun, 1=Mon, ..., 6=Sat for weekly
  due_date?: string | null;          // For one-time goals
  start_date: string;
  end_date?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalCompletion {
  id: string;
  user_id: string;
  goal_id: string;
  completion_date: string;  // Hijri YYYY-MM-DD
  gregorian_date: string;
  completed_at: string;
}

// Input types for creating/updating goals
export interface GoalInput {
  title: string;
  description?: string | null;
  recurrence_type: RecurrenceType;
  recurrence_pattern?: RecurrencePattern | null;
  recurrence_days?: number[] | null;
  due_date?: string | null;
  start_date?: string;
  end_date?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

// For displaying goals with completion status
export interface GoalWithStatus extends Goal {
  isCompleted: boolean;
  completionId?: string;
}

// Overdue goal metadata for missed goals carried forward
export interface OverdueGoal {
  goal: Goal;
  overdueDate: Date;          // Gregorian date when it was due
  overdueDateLabel: string;   // "Yesterday" or "8 Feb"
  overdueHijriDate: string;   // YYYY-MM-DD Hijri for completion recording
  overdueGregorianDate: string; // YYYY-MM-DD Gregorian for completion recording
}
