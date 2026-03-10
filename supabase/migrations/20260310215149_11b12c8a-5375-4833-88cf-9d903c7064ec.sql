
-- Create tasbeeh_counters table
CREATE TABLE public.tasbeeh_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text DEFAULT NULL,
  target_count integer DEFAULT NULL,
  current_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasbeeh_counters ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own tasbeeh_counters"
  ON public.tasbeeh_counters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasbeeh_counters"
  ON public.tasbeeh_counters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasbeeh_counters"
  ON public.tasbeeh_counters FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasbeeh_counters"
  ON public.tasbeeh_counters FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tasbeeh_counters_updated_at
  BEFORE UPDATE ON public.tasbeeh_counters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
