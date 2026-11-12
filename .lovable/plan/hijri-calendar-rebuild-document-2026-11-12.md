# Hijri Calendar Rebuild Document

A single, self-contained document you can paste into a new Claude project to rebuild the Ibadat Hijri calendar accurately. Saved to your Files as `hijri-calendar-spec.md` (plus a PDF copy if you want one).

## What the document will cover

1. **Overview** — what the calendar is (Dawoodi Bohra / Misri tabular calendar, not moon-sighting), and why it's predictable.
2. **The calculation rules**
   - 12 month names (English + Arabic, exactly as used in the app)
   - Month lengths (30/29 alternating, Zilhaj gets 30 in leap years)
   - The 30-year leap cycle and the exact leap-year positions
   - Starting reference point and the conversion method between Gregorian and Hijri, written as step-by-step formulas with the real code included
3. **When the day changes**
   - Hijri day advances at Maghrib (sunset), not midnight
   - "Daytime" vs "evening" Hijri date and which prayers belong to each
   - 12 AM progress reset and 4 AM qaza rollover
   - How Maghrib time is fetched (Aladhan, Method 1) and the fallback
4. **Display rules** — Arabic digits (١٤٤٧), Al-Kanz font, Hijri as primary and Gregorian as secondary, header layout.
5. **Calendar screens**
   - Week strip: swiping, today highlight, red/black/no dot rules for missed qaza
   - Month view: two-calendar grid, split header, activity dots
   - Day timeline: prayer cards, goals, undo qaza, "Add goal" action
   - Hijri date picker used in goal forms
6. **Data it relies on** — what's stored per day (prayer logs, goals) and the date format rules (`YYYY-MM-DD` comparisons, Gregorian storage).
7. **Test dates** — a table of known Gregorian ↔ Hijri pairs (including leap years and month edges) so the new build can be checked against this one.
8. **Edge cases & gotchas** — timezones, users near the date line / far south (NZ), before/after Maghrib, leap-year end of Zilhaj.

## How it will be made
- Read every calendar-related file in the app and copy the exact rules and formulas, not paraphrases.
- Generate the test-date table by running the app's own conversion code, so the numbers are guaranteed correct.
- Written in plain language with code blocks Claude can use directly.
- No changes to the app itself.
