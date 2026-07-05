## Audio Playback for Dua Reader

Add an audio bar fixed to the bottom of the dua detail page. Ship YouTube first, with a schema that also supports self-hosted MP3 later. Bottom nav is hidden on `/dua/:textId` and replaced by the audio bar.

### Data model

Add two nullable columns to `texts`:
- `youtube_id` (text) — e.g. `hlB8xUaNDfk`
- `audio_url` (text) — reserved for future self-hosted MP3

Populate Yaseen's row with `youtube_id = 'hlB8xUaNDfk'`. Other texts leave both null → no audio bar, normal nav.

### UX

**Audio bar (fixed bottom, replaces mobile nav on dua detail):**
- Left: play/pause button (primary circle, matches FAB style).
- Middle: text label ("Recitation" + reciter name if we add one later) and a slim scrubber showing progress with current / total time.
- Right: speed pill (`1×` → tap opens popover with 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2) and a chevron to expand the mini-player.
- Same glass/blur styling as the current bottom nav for visual continuity.

**Expandable mini-player:**
- Collapsed by default: audio bar only, YouTube iframe mounted but hidden (height 0). Playback works.
- Tap chevron: a small 16:9 video tile slides up above the bar (roughly 220px wide, right-aligned). Satisfies YouTube's visibility requirement while keeping the reader dominant.
- Tap again or a close affordance: collapses back to audio-only.

**Nav handling:**
- On `/dua/:textId`, `AppLayout` hides `MobileBottomNav` and renders the audio bar in its place. If the text has no audio configured, keep the normal nav.
- Reader page bottom padding stays the same (`pb-24`) so verses aren't obscured.

### Playback engine

- Use YouTube IFrame Player API (`https://www.youtube.com/iframe_api`). Load the script once, lazily, only when a dua detail page with a `youtube_id` mounts.
- Wrap in a small `useYouTubePlayer(videoId)` hook exposing: `isReady`, `isPlaying`, `currentTime`, `duration`, `play()`, `pause()`, `seek(t)`, `setPlaybackRate(r)`, `availableRates`.
- Speed options come from `player.getAvailablePlaybackRates()` (matches YouTube's native menu).
- Progress: `setInterval` polling `getCurrentTime()` at 500 ms while playing.
- Cleanup: destroy player on unmount / when leaving the route.

### Feasibility notes (already discussed with user)

- **iOS background/lock-screen:** YouTube iframes pause when the phone locks or the tab backgrounds. Acceptable trade-off for v1; self-hosted MP3 (Phase 2) will fix this via MediaSession API.
- **ToS:** expandable mini-player keeps the video reachable, satisfying YouTube's visibility requirement.
- **Schema is source-agnostic:** the audio bar reads `text.youtube_id ?? text.audio_url` and picks the engine. When we swap to MP3 later, only the engine hook changes.

### Files

**New**
- `src/components/reader/AudioBar.tsx` — the fixed bar + expandable video tile.
- `src/components/reader/YouTubePlayer.tsx` — hidden/visible iframe container controlled by the hook.
- `src/hooks/useYouTubePlayer.ts` — IFrame API wrapper.
- Migration: add `youtube_id` and `audio_url` to `texts`; set Yaseen's `youtube_id`.

**Edited**
- `src/components/layout/AppLayout.tsx` — on `/dua/:textId`, swap `MobileBottomNav` for `AudioBar` when the text has an audio source.
- `src/pages/Reader.tsx` — read `text.youtube_id` / `text.audio_url` and mount `AudioBar`.
- `src/hooks/useTextsLibrary.ts` — include the two new fields in the `useText` query.

### Out of scope (Phase 2+)

- Self-hosted MP3 upload flow and Supabase Storage bucket.
- MediaSession API / lock-screen controls.
- Per-verse timestamp highlighting synced with audio.
- Multiple reciter choices.
- Loop / repeat modes, sleep timer.
