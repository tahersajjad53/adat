
-- 1. App role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. has_role() security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Admin goals table
CREATE TABLE public.admin_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  recurrence_type text NOT NULL DEFAULT 'daily',
  recurrence_days integer[],
  recurrence_pattern jsonb,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  due_date date,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_goals ENABLE ROW LEVEL SECURITY;

-- Admin can full CRUD
CREATE POLICY "Admins can select admin_goals"
  ON public.admin_goals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR is_published = true);

CREATE POLICY "Admins can insert admin_goals"
  ON public.admin_goals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update admin_goals"
  ON public.admin_goals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admin_goals"
  ON public.admin_goals FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_admin_goals_updated_at
  BEFORE UPDATE ON public.admin_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Admin goal completions table
CREATE TABLE public.admin_goal_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_goal_id uuid NOT NULL REFERENCES public.admin_goals(id) ON DELETE CASCADE,
  completion_date date NOT NULL,
  gregorian_date date NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, admin_goal_id, completion_date)
);
ALTER TABLE public.admin_goal_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own admin_goal_completions"
  ON public.admin_goal_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own admin_goal_completions"
  ON public.admin_goal_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own admin_goal_completions"
  ON public.admin_goal_completions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6. User preferences table
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  dynamic_goals_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Seed admin role for app.ibadat@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'app.ibadat@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
