# send-goal-reminders

Edge Function that finds goals due for a reminder in the next 15 minutes (per user timezone), then sends push notifications via Firebase Cloud Messaging (FCM).

## Secrets (Supabase Dashboard → Project Settings → Edge Functions → Secrets)

- **SUPABASE_URL**, **SUPABASE_SERVICE_ROLE_KEY** – Usually set by default.
- **FCM_SERVICE_ACCOUNT_JSON** – Full JSON string of your Firebase service account key (Project settings → Service accounts → Generate new private key). Paste the entire JSON as the secret value.
- **FCM_PROJECT_ID** – (Optional) Firebase project ID, e.g. `ibadat-e1fd2`. Defaults to `ibadat-e1fd2` if unset.
- **CRON_SECRET** – (Optional) If set, the function only accepts requests with `Authorization: Bearer <CRON_SECRET>`. Use this when invoking from a cron job.

## Scheduling (cron)

Run the function every 5–15 minutes so reminders are sent on time.

### Option A: Supabase pg_cron + pg_net

If your project has `pg_net` and `pg_cron` enabled:

1. Get the function URL: `https://<project_ref>.supabase.co/functions/v1/send-goal-reminders`
2. Schedule with pg_cron to call it via `net.http_post` (or use the Supabase Dashboard cron feature if available).

### Option B: External cron

Use a cron service (e.g. cron-job.org, GitHub Actions scheduled workflow) to POST to the function URLs every 5–15 minutes:

```bash
# Goal reminders
curl -X POST "https://<project_ref>.supabase.co/functions/v1/send-goal-reminders" \
  -H "Authorization: Bearer <CRON_SECRET>"

# Namaz reminders (prayer-time alerts)
curl -X POST "https://<project_ref>.supabase.co/functions/v1/send-namaz-reminders" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Set **CRON_SECRET** in Edge Function secrets and use the same value in the `Authorization` header so only your cron job can invoke the functions.

## Behaviour

- Loads active goals that have `preferred_time` and `reminder_offset` (not `none`).
- Joins with `profiles` where `push_enabled = true` and `push_token` is not null.
- For each goal, in the user’s `timezone`, checks if the goal is due “today” (daily, weekly, or one-time) and if the reminder time (preferred_time − offset) falls in the next 15 minutes.
- Skips goals already completed today (checks `goal_completions` by `gregorian_date` in user local date).
- Sends one FCM notification per due reminder with `data.goal_id` and `data.screen: "goals"` for deep linking.

Recurrence types supported for “due today”: **daily**, **weekly**, **one-time**. Custom and annual are not yet considered (can be added later with Hijri support if needed).
