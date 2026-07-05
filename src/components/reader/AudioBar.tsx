import React, { useState } from 'react';
import { Play, Pause, NavArrowUp, NavArrowDown } from 'iconoir-react';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { cn } from '@/lib/utils';

interface AudioBarProps {
  youtubeId: string;
  label?: string;
}

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioBar({ youtubeId, label = 'Recitation' }: AudioBarProps) {
  const {
    containerRef, isReady, isPlaying, currentTime, duration,
    playbackRate, availableRates, toggle, seek, setRate,
  } = useYouTubePlayer(youtubeId);
  const [expanded, setExpanded] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-min">
      {/* Expandable video tile */}
      <div
        className={cn(
          'flex justify-end px-3 transition-all duration-200',
          expanded ? 'opacity-100 mb-2' : 'opacity-0 pointer-events-none h-0 overflow-hidden',
        )}
      >
        <div className="w-[220px] aspect-video rounded-lg overflow-hidden shadow-lg bg-black">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>

      {/* Hidden player container (used when collapsed) */}
      {!expanded && (
        <div className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none">
          <div ref={containerRef} className="w-full h-full" />
        </div>
      )}

      <div className="bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-t border-border/50 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3 px-3 py-2.5 min-h-16">
          {/* Play / pause */}
          <button
            onClick={toggle}
            disabled={!isReady}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-primary-foreground shadow active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPlaying
              ? <Pause className="h-5 w-5" strokeWidth={2.5} />
              : <Play className="h-5 w-5" strokeWidth={2.5} />}
          </button>

          {/* Label + scrubber */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-foreground truncate">{label}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              max={100}
              step={0.1}
              onValueChange={([v]) => {
                if (duration > 0) seek((v / 100) * duration);
              }}
              className="mt-1"
            />
          </div>

          {/* Speed */}
          <Popover open={speedOpen} onOpenChange={setSpeedOpen}>
            <PopoverTrigger asChild>
              <button
                className="text-xs font-semibold px-2 py-1 rounded-md bg-muted text-foreground min-w-11"
                aria-label="Playback speed"
              >
                {playbackRate}×
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-28 p-1">
              {availableRates.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRate(r); setSpeedOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent',
                    r === playbackRate && 'bg-accent font-semibold',
                  )}
                >
                  {r}×
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Hide video' : 'Show video'}
            className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:bg-accent"
          >
            {expanded
              ? <NavArrowDown className="h-5 w-5" />
              : <NavArrowUp className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
