# send-namaz-reminders

Edge Function that sends push notifications at each prayer time (Fajr, Zuhr, Asr, Maghrib, Isha). Uses the Aladhan API for prayer times based on each user's location.

## Secrets

Same as `send-goal-reminders`:

- **SUPABASE_URL**, **SUPABASE_SERVICE_ROLE_KEY** – Usually set by default.
- **FCM_SERVICE_ACCOUNT_JSON** – Full JSON string of your Firebase service account key.
- **FCM_PROJECT_ID** – (Optional) Firebase project ID. Defaults to `ibadat-e1fd2`.
- **CRON_SECRET** – (Optional) If set, the function only accepts requests with `Authorization: Bearer <CRON_SECRET>`.

## Scheduling (cron)

Run this function every 5–10 minutes (same schedule as `send-goal-reminders`). Prayer times are fixed per day; the function sends when the current time (in each user's timezone) falls within a 5-minute window of a prayer time.

### Option A: External cron

Add a second cron job to call both functions:

```bash
# Goal reminders
curl -X POST "https://<project_ref>.supabase.co/functions/v1/send-goal-reminders" \
  -H "Authorization: Bearer <CRON_SECRET>"

# Namaz reminders (add alongside or in same script)
curl -X POST "https://<project_ref>.supabase.co/functions/v1/send-namaz-reminders" \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### Option B: pg_cron

If using pg_cron + pg_net, schedule both `send-goal-reminders` and `send-namaz-reminders` to run every 5–10 minutes.

## Behaviour

- Loads profiles where `push_enabled = true`, `namaz_reminders_enabled = true`, `push_token` is not null, and `latitude`/`longitude` are set.
- For each user, fetches today's prayer times from Aladhan API using their location and timezone.
- If current time (in user's timezone) is within 5 minutes of a prayer time, sends FCM notification: "It's time to pray Maghrib" (or Fajr, Zuhr, Asr, Isha).
- Notification tap navigates to `/namaz` via `data.screen: "namaz"`.
