-- Create sabeels table (main family unit)
CREATE TABLE public.sabeels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sabeel_name TEXT NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  calendar_type TEXT NOT NULL DEFAULT 'hijri' CHECK (calendar_type IN ('hijri', 'gregorian')),
  start_month INT NOT NULL CHECK (start_month >= 1 AND start_month <= 12),
  start_year INT NOT NULL,
  end_month INT CHECK (end_month >= 1 AND end_month <= 12),
  end_year INT,
  reminder_type TEXT NOT NULL DEFAULT 'before_7_days' CHECK (reminder_type IN ('before_7_days', 'last_day', 'custom')),
  reminder_day INT CHECK (reminder_day >= 1 AND reminder_day <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fmb_hubs table (FMB contributions, one per Sabeel)
CREATE TABLE public.fmb_hubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sabeel_id UUID NOT NULL REFERENCES public.sabeels(id) ON DELETE CASCADE,
  monthly_amount NUMERIC NOT NULL,
  calendar_type TEXT NOT NULL DEFAULT 'hijri' CHECK (calendar_type IN ('hijri', 'gregorian')),
  start_month INT NOT NULL CHECK (start_month >= 1 AND start_month <= 12),
  start_year INT NOT NULL,
  end_month INT CHECK (end_month >= 1 AND end_month <= 12),
  end_year INT,
  reminder_type TEXT NOT NULL DEFAULT 'before_7_days' CHECK (reminder_type IN ('before_7_days', 'last_day', 'custom')),
  reminder_day INT CHECK (reminder_day >= 1 AND reminder_day <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create khumus table (individual Khumus obligations)
CREATE TABLE public.khumus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sabeel_id UUID NOT NULL REFERENCES public.sabeels(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  calculation_type TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'percentage')),
  fixed_amount NUMERIC,
  monthly_income NUMERIC,
  percentage_rate NUMERIC DEFAULT 20,
  calendar_type TEXT NOT NULL DEFAULT 'hijri' CHECK (calendar_type IN ('hijri', 'gregorian')),
  reminder_type TEXT NOT NULL DEFAULT 'before_7_days' CHECK (reminder_type IN ('before_7_days', 'last_day', 'custom')),
  reminder_day INT CHECK (reminder_day >= 1 AND reminder_day <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create zakats table (individual Zakat obligations)
CREATE TABLE public.zakats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sabeel_id UUID NOT NULL REFERENCES public.sabeels(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  calculation_type TEXT NOT NULL DEFAULT 'fixed' CHECK (calculation_type IN ('fixed', 'nisab_based')),
  fixed_amount NUMERIC,
  assets_value NUMERIC,
  nisab_threshold NUMERIC,
  zakat_rate NUMERIC DEFAULT 2.5,
  calendar_type TEXT NOT NULL DEFAULT 'hijri' CHECK (calendar_type IN ('hijri', 'gregorian')),
  reminder_type TEXT NOT NULL DEFAULT 'before_7_days' CHECK (reminder_type IN ('before_7_days', 'last_day', 'custom')),
  reminder_day INT CHECK (reminder_day >= 1 AND reminder_day <= 31),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create due_payments table (payment tracking)
CREATE TABLE public.due_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_type TEXT NOT NULL CHECK (due_type IN ('sabeel', 'fmb', 'khumus', 'zakat')),
  reference_id UUID NOT NULL,
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('hijri', 'gregorian')),
  due_month INT NOT NULL CHECK (due_month >= 1 AND due_month <= 12),
  due_year INT NOT NULL,
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sabeels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fmb_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khumus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.due_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sabeels (direct user_id check)
CREATE POLICY "Users can view own sabeels"
  ON public.sabeels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sabeels"
  ON public.sabeels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sabeels"
  ON public.sabeels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sabeels"
  ON public.sabeels FOR DELETE
  USING (auth.uid() = user_id);

-- Security definer function to check sabeel ownership
CREATE OR REPLACE FUNCTION public.owns_sabeel(_user_id UUID, _sabeel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sabeels
    WHERE id = _sabeel_id AND user_id = _user_id
  )
$$;

-- RLS Policies for fmb_hubs (via sabeel ownership)
CREATE POLICY "Users can view own fmb_hubs"
  ON public.fmb_hubs FOR SELECT
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can create fmb_hubs for own sabeels"
  ON public.fmb_hubs FOR INSERT
  WITH CHECK (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can update own fmb_hubs"
  ON public.fmb_hubs FOR UPDATE
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can delete own fmb_hubs"
  ON public.fmb_hubs FOR DELETE
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

-- RLS Policies for khumus (via sabeel ownership)
CREATE POLICY "Users can view own khumus"
  ON public.khumus FOR SELECT
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can create khumus for own sabeels"
  ON public.khumus FOR INSERT
  WITH CHECK (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can update own khumus"
  ON public.khumus FOR UPDATE
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can delete own khumus"
  ON public.khumus FOR DELETE
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

-- RLS Policies for zakats (via sabeel ownership)
CREATE POLICY "Users can view own zakats"
  ON public.zakats FOR SELECT
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can create zakats for own sabeels"
  ON public.zakats FOR INSERT
  WITH CHECK (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can update own zakats"
  ON public.zakats FOR UPDATE
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

CREATE POLICY "Users can delete own zakats"
  ON public.zakats FOR DELETE
  USING (public.owns_sabeel(auth.uid(), sabeel_id));

-- RLS Policies for due_payments (direct user_id check)
CREATE POLICY "Users can view own due_payments"
  ON public.due_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own due_payments"
  ON public.due_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own due_payments"
  ON public.due_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own due_payments"
  ON public.due_payments FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_sabeels_updated_at
  BEFORE UPDATE ON public.sabeels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fmb_hubs_updated_at
  BEFORE UPDATE ON public.fmb_hubs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_khumus_updated_at
  BEFORE UPDATE ON public.khumus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zakats_updated_at
  BEFORE UPDATE ON public.zakats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();