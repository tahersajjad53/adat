-- Add created_at column to profiles table to track user signup date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing profiles to use the auth.users created_at if available
-- This is a one-time backfill for existing users
UPDATE public.profiles p
SET created_at = COALESCE(
  (SELECT created_at FROM auth.users u WHERE u.id = p.id),
  now()
)
WHERE p.created_at IS NULL;

-- Create prayer_logs table
CREATE TABLE public.prayer_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_date DATE NOT NULL,
  prayer TEXT NOT NULL CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  completed_at TIMESTAMP WITH TIME ZONE,
  qaza_completed_at TIMESTAMP WITH TIME ZONE,
  gregorian_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate entries for the same prayer on the same day
  UNIQUE (user_id, prayer_date, prayer)
);

-- Enable Row Level Security
ALTER TABLE public.prayer_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own prayer logs
CREATE POLICY "Users can view own prayers"
  ON public.prayer_logs 
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prayer logs
CREATE POLICY "Users can insert own prayers"
  ON public.prayer_logs 
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prayer logs
CREATE POLICY "Users can update own prayers"
  ON public.prayer_logs 
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own prayer logs
CREATE POLICY "Users can delete own prayers"
  ON public.prayer_logs 
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for efficient querying by user and date
CREATE INDEX idx_prayer_logs_user_date ON public.prayer_logs(user_id, prayer_date);

-- Create index for querying missed prayers (completed_at is NULL)
CREATE INDEX idx_prayer_logs_missed ON public.prayer_logs(user_id, completed_at) WHERE completed_at IS NULL;