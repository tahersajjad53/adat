
-- Add owner column; NULL = global/admin tag
ALTER TABLE public.tags ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Replace single UNIQUE(slug) with partial uniques scoped by ownership
ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_slug_key;
CREATE UNIQUE INDEX tags_slug_global_unique ON public.tags (slug) WHERE user_id IS NULL;
CREATE UNIQUE INDEX tags_slug_user_unique ON public.tags (user_id, slug) WHERE user_id IS NOT NULL;
-- Prevent duplicate labels (case-insensitive) per user
CREATE UNIQUE INDEX tags_label_user_unique ON public.tags (user_id, lower(label)) WHERE user_id IS NOT NULL;

-- Label length cap
ALTER TABLE public.tags ADD CONSTRAINT tags_label_length_check CHECK (char_length(label) BETWEEN 1 AND 24);

-- Index for fast personal-tag lookup
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags (user_id);

-- Per-user cap of 30 personal tags
CREATE OR REPLACE FUNCTION public.enforce_user_tag_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    IF (SELECT count(*) FROM public.tags WHERE user_id = NEW.user_id) >= 30 THEN
      RAISE EXCEPTION 'You can have at most 30 personal tags.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_user_tag_limit_trg ON public.tags;
CREATE TRIGGER enforce_user_tag_limit_trg
  BEFORE INSERT ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_tag_limit();

-- When a personal tag is removed, clear it from the user's goals
CREATE OR REPLACE FUNCTION public.clear_goal_tag_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id IS NOT NULL THEN
    UPDATE public.goals
      SET tag = NULL
      WHERE user_id = OLD.user_id AND tag = OLD.slug;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS clear_goal_tag_on_delete_trg ON public.tags;
CREATE TRIGGER clear_goal_tag_on_delete_trg
  AFTER DELETE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.clear_goal_tag_on_delete();

-- RLS: let users see, create, rename, and delete their own personal tags
CREATE POLICY "Users can view their own tags"
  ON public.tags FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tags"
  ON public.tags FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tags"
  ON public.tags FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own tags"
  ON public.tags FOR DELETE TO authenticated
  USING (user_id = auth.uid());
