
-- Create tags table for admin-managed goal tags
CREATE TABLE public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active tags
CREATE POLICY "Authenticated users can view active tags"
  ON public.tags FOR SELECT TO authenticated
  USING (is_active = true);

-- Admins can view all tags (including inactive)
CREATE POLICY "Admins can view all tags"
  ON public.tags FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert tags
CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update tags
CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete tags
CREATE POLICY "Admins can delete tags"
  ON public.tags FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed with existing hardcoded tags
INSERT INTO public.tags (label, slug, sort_order) VALUES
  ('Quran', 'quran', 0),
  ('Dua', 'dua', 1),
  ('Tasbeeh', 'tasbeeh', 2),
  ('Sadakah', 'sadakah', 3),
  ('Nazrul Maqam', 'nazrul_maqam', 4);
