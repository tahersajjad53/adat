

## Phase Out the Namaz Page

Since the Namaz page is already inaccessible from navigation (not in bottom nav or sidebar), this is a cleanup task to remove dead code.

### What gets removed

**Namaz-only files (delete)**
| File | Reason |
|---|---|
| `src/pages/Namaz.tsx` | The page itself |
| `src/components/namaz/PrayerList.tsx` | Only used by Namaz page |
| `src/components/namaz/MissedPrayersList.tsx` | Only used by Namaz page |
| `src/components/namaz/MissedPrayerCard.tsx` | Only used by MissedPrayersList |
| `src/components/namaz/CurrentPrayerCard.tsx` | Not imported anywhere currently |
| `src/hooks/useMissedPrayers.ts` | Only used by Namaz page |

**What stays (shared with Dashboard and/or Calendar)**
| File | Used by |
|---|---|
| `src/components/namaz/TimeOfDayCard.tsx` | Dashboard, Namaz |
| `src/components/namaz/DailyMeter.tsx` | Dashboard, Namaz |
| `src/components/namaz/PrayerCard.tsx` | Calendar timeline |
| `src/hooks/usePrayerLog.ts` | Dashboard |
| `src/hooks/usePrayerTimes.ts` | Dashboard, Calendar, CalendarDay |
| `src/hooks/useQazaMonitoring.ts` | Profile, Calendar |
| `src/hooks/useOnTimePrayerStats.ts` | Profile |
| `src/hooks/useWeekQazaIndicators.ts` | Calendar |

### Files modified

| File | Change |
|---|---|
| `src/App.tsx` | Remove Namaz import and `/namaz` route |
| `src/components/layout/AppLayout.tsx` | Remove `isNamazPage`, `namazMenuItems` state, and the `namaz:menuChanged` event listener (all now dead code) |
| `supabase/functions/send-namaz-reminders/index.ts` | Keep as-is (push notification backend, independent of page) |
| Profile page | Keep as-is (namaz reminder toggle and qaza monitoring settings are still functional features) |

### Summary
- Delete 6 files (1 page, 3 components, 1 hook, 1 unused component)
- Edit 2 files (App.tsx route removal, AppLayout cleanup)
- Keep all shared prayer hooks/components used by Dashboard and Calendar

