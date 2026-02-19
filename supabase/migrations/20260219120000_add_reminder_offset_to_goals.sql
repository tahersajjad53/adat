-- Add reminder_offset for goal reminder scheduling (safe to run if column exists)
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS reminder_offset TEXT;
