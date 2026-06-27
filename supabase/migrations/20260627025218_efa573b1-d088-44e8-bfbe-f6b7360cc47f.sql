DROP POLICY IF EXISTS "Authenticated users can view active tags" ON public.tags;

CREATE POLICY "Authenticated users can view active global tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING (is_active = true AND user_id IS NULL);