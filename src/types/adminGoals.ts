export interface AdminGoal {
  id: string;
  title: string;
  description?: string | null;
  recurrence_type: string;
  recurrence_days?: number[] | null;
  recurrence_pattern?: any;
  start_date: string;
  end_date?: string | null;
  due_date?: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminGoalInput {
  title: string;
  description?: string | null;
  recurrence_type: string;
  recurrence_days?: number[] | null;
  recurrence_pattern?: any;
  start_date?: string;
  end_date?: string | null;
  due_date?: string | null;
  is_published?: boolean;
  sort_order?: number;
}

export interface AdminGoalCompletion {
  id: string;
  user_id: string;
  admin_goal_id: string;
  completion_date: string;
  gregorian_date: string;
  completed_at: string;
}
