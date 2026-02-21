// Send Namaz (prayer time) reminder push notifications via FCM.
// Invoke on a schedule (e.g. every 5-10 min) via cron or external scheduler.
// Requires secrets: SUPABASE_SERVICE_ROLE_KEY, FCM_SERVICE_ACCOUNT_JSON.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const NAMAZ_WINDOW_MINUTES = 5;
const FCM_SEND_URL = "https://fcm.googleapis.com/v1/projects";
const ALADHAN_API = "https://api.aladhan.com/v1/timings";

// Aladhan API keys -> display name for notification
const PRAYER_DISPLAY_NAMES: Record<string, string> = {
  Fajr: "Fajr",
  Dhuhr: "Zuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface ProfileRow {
  id: string;
  push_token: string | null;
  push_enabled: boolean | null;
  namaz_reminders_enabled: boolean | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

interface AladhanTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.split(" ")[0]; // Remove "(PKT)" etc.
  const [h, m] = clean.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

async function fetchPrayerTimes(
  nowUtc: Date,
  lat: number,
  lng: number,
  timezone: string
): Promise<AladhanTimings | null> {
  // Use date in user's timezone so we get correct day's prayer times
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(nowUtc);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const dateStr = `${get("day")}-${get("month")}-${get("year")}`;
  const url = new URL(`${ALADHAN_API}/${dateStr}`);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("method", "1"); // Shia Ithna-Ashari

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  const timings = data?.data?.timings;
  if (!timings) return null;
  return timings as AladhanTimings;
}

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };
  const key = await jose.importPKCS8(sa.private_key, "RS256");
  const jwt = await new jose.SignJWT({
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  })
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
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

    const { data: profilesRows } = await supabase
      .from("profiles")
      .select(
        "id, push_token, push_enabled, namaz_reminders_enabled, latitude, longitude, timezone"
      )
      .eq("push_enabled", true)
      .eq("namaz_reminders_enabled", true)
      .not("push_token", "is", null)
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (!profilesRows?.length) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No users with namaz reminders enabled" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const profiles = profilesRows as ProfileRow[];
    const nowUtc = new Date();
    const dueReminders: { profile: ProfileRow; prayer: string; displayName: string }[] = [];

    for (const profile of profiles) {
      if (!profile.push_token || !profile.latitude || !profile.longitude) continue;

      const tz = profile.timezone ?? "UTC";
      const lat = Number(profile.latitude);
      const lng = Number(profile.longitude);

      const timings = await fetchPrayerTimes(nowUtc, lat, lng, tz);
      if (!timings) continue;

      // Get current time in user's timezone (minutes since midnight)
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(nowUtc);
      const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "0";
      const currentMinutes =
        parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);

      // Check each prayer: is current time within NAMAZ_WINDOW_MINUTES of prayer time?
      for (const key of PRAYER_ORDER) {
        const timeStr = timings[key as keyof AladhanTimings];
        if (!timeStr) continue;

        const prayerMinutes = parseTimeToMinutes(timeStr);
        const diff = currentMinutes - prayerMinutes;

        // Send if we're 0 to NAMAZ_WINDOW_MINUTES minutes after prayer time
        if (diff >= 0 && diff < NAMAZ_WINDOW_MINUTES) {
          const displayName = PRAYER_DISPLAY_NAMES[key] ?? key;
          dueReminders.push({ profile, prayer: key, displayName });
        }
      }
    }

    if (dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No namaz reminders due in window" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getGoogleAccessToken(fcmSaJson);
    let sent = 0;
    for (const { profile, displayName } of dueReminders) {
      const ok = await sendFcm(
        fcmProjectId,
        accessToken,
        profile.push_token!,
        "Namaz reminder",
        `It's time to pray ${displayName}`,
        { screen: "namaz" }
      );
      if (ok) sent++;
    }

    return new Response(
      JSON.stringify({ sent, total: dueReminders.length }),
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
