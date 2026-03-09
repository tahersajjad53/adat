ALTER TABLE public.prayer_logs
  DROP CONSTRAINT IF EXISTS prayer_logs_prayer_check,
  ADD CONSTRAINT prayer_logs_prayer_check
    CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'nisfulLayl'));