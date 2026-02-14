import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  rotation: number;
  shape: 'circle' | 'square';
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--accent))',
  'hsl(var(--accent) / 0.7)',
  'hsl(var(--primary) / 0.5)',
  'hsl(var(--accent) / 0.5)',
];

const PARTICLE_COUNT = 24;
const DURATION = 700;

function generateParticles(originX: number, originY: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: originX,
    y: originY,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 4,
    angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5,
    velocity: 40 + Math.random() * 60,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }));
}

const ConfettiBurst: React.FC<{ x: number; y: number; onDone: () => void }> = ({
  x,
  y,
  onDone,
}) => {
  const particles = useRef(generateParticles(x, y)).current;

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    >
      {particles.map((p) => {
        const tx = Math.cos(p.angle) * p.velocity;
        const ty = Math.sin(p.angle) * p.velocity - 20; // slight upward bias

        return (
          <span
            key={p.id}
            className="absolute"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${p.rotation}deg)`,
              animation: `confetti-burst ${DURATION}ms cubic-bezier(0, 0.6, 0.5, 1) forwards`,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

interface ConfettiState {
  key: number;
  x: number;
  y: number;
}

export function useConfetti() {
  const [bursts, setBursts] = useState<ConfettiState[]>([]);
  const keyRef = useRef(0);

  const triggerConfetti = useCallback((element?: HTMLElement | null) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (element) {
      const rect = element.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const key = ++keyRef.current;
    setBursts((prev) => [...prev, { key, x, y }]);
  }, []);

  const removeBurst = useCallback((key: number) => {
    setBursts((prev) => prev.filter((b) => b.key !== key));
  }, []);

  const ConfettiPortal = useCallback(
    () =>
      bursts.length > 0
        ? createPortal(
            <>
              {bursts.map((burst) => (
                <ConfettiBurst
                  key={burst.key}
                  x={burst.x}
                  y={burst.y}
                  onDone={() => removeBurst(burst.key)}
                />
              ))}
            </>,
            document.body
          )
        : null,
    [bursts, removeBurst]
  );

  return { triggerConfetti, ConfettiPortal };
}
