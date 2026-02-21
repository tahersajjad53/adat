-- Add goal_reminders_enabled and namaz_reminders_enabled to profiles.
-- goal_reminders_enabled: default true for backward compatibility
-- namaz_reminders_enabled: default false (new feature)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_reminders_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS namaz_reminders_enabled boolean NOT NULL DEFAULT false;
