# Supabase

## Applying migrations

To fix the **reminder_offset** (and any other pending) schema changes:

1. **Linked project (Supabase Cloud)**  
   From the project root:
   ```bash
   npm run db:push
   ```
   Or: `npx supabase db push`

2. **Manual SQL (Supabase Dashboard)**  
   In [Supabase Dashboard](https://supabase.com/dashboard) → your project → SQL Editor, run:
   ```sql
   ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS reminder_offset TEXT;
   ```

To see which migrations are applied (after linking):
```bash
npm run db:migration:list
```
