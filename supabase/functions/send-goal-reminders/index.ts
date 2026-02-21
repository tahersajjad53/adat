// Send goal reminder push notifications via FCM.
// Invoke on a schedule (e.g. every 5–15 min) via cron or external scheduler.
// Requires secrets: SUPABASE_SERVICE_ROLE_KEY, FCM_SERVICE_ACCOUNT_JSON (full JSON string of Firebase service account key).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const REMINDER_WINDOW_MINUTES = 15;
const FCM_SEND_URL = "https://fcm.googleapis.com/v1/projects";

type ReminderOffset =
  | "none"
  | "at_time"
  | "5m"
  | "10m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "1d"
  | "2d";

function reminderOffsetToMinutes(offset: string | null): number | null {
  if (!offset || offset === "none") return null;
  const map: Record<string, number> = {
    at_time: 0,
    "5m": 5,
    "10m": 10,
    "15m": 15,
    "30m": 30,
    "1h": 60,
    "2h": 120,
    "1d": 1440,
    "2d": 2880,
  };
  return map[offset] ?? null;
}

interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  recurrence_type: string;
  recurrence_days: number[] | null;
  due_date: string | null;
  start_date: string;
  end_date: string | null;
  preferred_time: string | null;
  reminder_offset: string | null;
}

interface ProfileRow {
  push_token: string | null;
  push_enabled: boolean | null;
  goal_reminders_enabled: boolean | null;
  timezone: string | null;
}

interface GoalWithProfile extends GoalRow {
  push_token: string;
  timezone: string;
}

function isDueToday(goal: GoalRow, localDateStr: string, localDayOfWeek: number): boolean {
  if (localDateStr < goal.start_date) return false;
  if (goal.end_date && localDateStr > goal.end_date) return false;

  switch (goal.recurrence_type) {
    case "daily":
      return true;
    case "weekly":
      if (!goal.recurrence_days?.length) return false;
      return goal.recurrence_days.includes(localDayOfWeek);
    case "one-time":
      return goal.due_date === localDateStr;
    default:
      return false;
  }
}

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };
  const key = await jose.importPKCS8(sa.private_key, "RS256");
  const jwt = await new jose.SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function sendFcm(
  projectId: string,
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<boolean> {
  const url = `${FCM_SEND_URL}/${projectId}/messages:send`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: { priority: "high" },
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`FCM send failed: ${res.status} ${text}`);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fcmSaJson = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
    const fcmProjectId = Deno.env.get("FCM_PROJECT_ID") ?? "ibadat-e1fd2";

    if (!fcmSaJson) {
      console.error("FCM_SERVICE_ACCOUNT_JSON not set");
      return new Response(
        JSON.stringify({ error: "FCM not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: goalsRows } = await supabase
      .from("goals")
      .select(
        "id, user_id, title, recurrence_type, recurrence_days, due_date, start_date, end_date, preferred_time, reminder_offset"
      )
      .eq("is_active", true)
      .not("preferred_time", "is", null)
      .not("reminder_offset", "is", null)
      .neq("reminder_offset", "none");

    if (!goalsRows?.length) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No goals with reminders" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const userIds = [...new Set(goalsRows.map((g) => g.user_id))];
    const { data: profilesRows } = await supabase
      .from("profiles")
      .select("id, push_token, push_enabled, goal_reminders_enabled, timezone")
      .in("id", userIds);

    const profileByUserId = new Map<string, ProfileRow>();
    for (const p of profilesRows ?? []) {
      profileByUserId.set(p.id, p as ProfileRow);
    }

    const goalsWithProfile: GoalWithProfile[] = [];
    for (const g of goalsRows as GoalRow[]) {
      const profile = profileByUserId.get(g.user_id) as ProfileRow | undefined;
      if (
        !profile?.push_token ||
        profile.push_enabled === false ||
        profile.goal_reminders_enabled === false
      )
        continue;
      const tz = profile.timezone ?? "UTC";
      goalsWithProfile.push({ ...g, push_token: profile.push_token, timezone: tz });
    }

    const nowUtc = new Date();
    const dueReminders: {
      goal: GoalWithProfile;
      reminderMinutes: number;
      localDateStr: string;
    }[] = [];

    for (const goal of goalsWithProfile) {
      const offsetMins = reminderOffsetToMinutes(goal.reminder_offset);
      if (offsetMins === null) continue;

      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: goal.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(nowUtc);
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
      const localDateStr = `${get("year")}-${get("month")}-${get("day")}`;
      const localDayOfWeek = new Date(
        `${localDateStr}T12:00:00`
      ).getDay();
      const currentMinutes = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);

      if (!isDueToday(goal, localDateStr, localDayOfWeek)) continue;

      const [ph, pm] = (goal.preferred_time ?? "00:00").split(":").map(Number);
      const preferredMinutes = ph * 60 + pm;
      const reminderMinutes = Math.max(0, preferredMinutes - offsetMins);
      const windowEnd = currentMinutes + REMINDER_WINDOW_MINUTES;
      if (reminderMinutes >= currentMinutes && reminderMinutes < windowEnd) {
        dueReminders.push({ goal, reminderMinutes, localDateStr });
      }
    }

    const completedToday = new Set<string>();
    for (const { goal, localDateStr } of dueReminders) {
      const { data: comps } = await supabase
        .from("goal_completions")
        .select("id")
        .eq("goal_id", goal.id)
        .eq("gregorian_date", localDateStr)
        .limit(1);
      if (comps?.length) completedToday.add(goal.id);
    }

    const toSend = dueReminders.filter((r) => !completedToday.has(r.goal.id));
    if (toSend.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No reminders due in window" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getGoogleAccessToken(fcmSaJson);
    let sent = 0;
    for (const { goal } of toSend) {
      const ok = await sendFcm(
        fcmProjectId,
        accessToken,
        goal.push_token,
        "Goal reminder",
        goal.title,
        { goal_id: goal.id, screen: "goals" }
      );
      if (ok) sent++;
    }

    return new Response(
      JSON.stringify({ sent, total: toSend.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
