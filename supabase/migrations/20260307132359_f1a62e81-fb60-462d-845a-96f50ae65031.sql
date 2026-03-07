ALTER TABLE public.prayer_logs
  ADD COLUMN prayer_window_start time without time zone,
  ADD COLUMN prayer_window_end time without time zone;