-- Create goals table for tracking recurring habits
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  recurrence_type TEXT NOT NULL DEFAULT 'daily',
  recurrence_pattern JSONB,
  recurrence_days INTEGER[],
  due_date DATE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goal_completions table for tracking daily completions
CREATE TABLE public.goal_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  gregorian_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_id, completion_date)
);

-- Enable RLS on both tables
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for goals
CREATE POLICY "Users can view own goals"
  ON public.goals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON public.goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for goal_completions
CREATE POLICY "Users can view own completions"
  ON public.goal_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own completions"
  ON public.goal_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON public.goal_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.goal_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on goals
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_is_active ON public.goals(is_active);
CREATE INDEX idx_goal_completions_user_date ON public.goal_completions(user_id, completion_date);
CREATE INDEX idx_goal_completions_goal_id ON public.goal_completions(goal_id);