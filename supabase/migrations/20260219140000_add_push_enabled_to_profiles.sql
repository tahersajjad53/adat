-- Allow backend to skip users who have disabled push notifications.
-- When user toggles off in Profile, we set push_enabled = false and clear push_token.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_enabled boolean NOT NULL DEFAULT true;
