import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings for the YouTube IFrame API we use.
declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, options: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; CUED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  destroy: () => void;
}

const API_SRC = 'https://www.youtube.com/iframe_api';
let apiPromise: Promise<void> | null = null;

function loadApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = API_SRC;
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return apiPromise;
}

export interface UseYouTubePlayer {
  containerRef: React.RefObject<HTMLDivElement>;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  availableRates: number[];
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  setRate: (r: number) => void;
}

export function useYouTubePlayer(videoId: string | null | undefined): UseYouTubePlayer {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [availableRates, setAvailableRates] = useState<number[]>([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    loadApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;
      const player = new window.YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 0 },
        events: {
          onReady: () => {
            playerRef.current = player;
            setIsReady(true);
            setDuration(player.getDuration());
            setAvailableRates(player.getAvailablePlaybackRates());
            setPlaybackRate(player.getPlaybackRate());
          },
          onStateChange: (e: { data: number }) => {
            const s = window.YT!.PlayerState;
            setIsPlaying(e.data === s.PLAYING);
            if (e.data === s.PLAYING || e.data === s.BUFFERING) {
              setDuration(player.getDuration());
            }
          },
          onPlaybackRateChange: (e: { data: number }) => setPlaybackRate(e.data),
        },
      });
    });

    interval = setInterval(() => {
      const p = playerRef.current;
      if (p && typeof p.getCurrentTime === 'function') {
        setCurrentTime(p.getCurrentTime());
      }
    }, 500);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      setIsReady(false);
      setIsPlaying(false);
      setCurrentTime(0);
    };
  }, [videoId]);

  const play = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const toggle = useCallback(() => {
    if (isPlaying) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  }, [isPlaying]);
  const seek = useCallback((t: number) => playerRef.current?.seekTo(t, true), []);
  const setRate = useCallback((r: number) => playerRef.current?.setPlaybackRate(r), []);

  return {
    containerRef,
    isReady,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    availableRates,
    play,
    pause,
    toggle,
    seek,
    setRate,
  };
}
