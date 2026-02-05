-- Backfill missing profile rows for existing users who signed up before the trigger was created
INSERT INTO public.profiles (id, updated_at)
SELECT id, now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;