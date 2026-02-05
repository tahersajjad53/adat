-- Add location fields to profiles table for prayer time calculations
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT;