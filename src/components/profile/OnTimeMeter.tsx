import React from 'react';

interface OnTimeMeterProps {
  percentage: number;
  totalTracked: number;
}

const OnTimeMeter: React.FC<OnTimeMeterProps> = ({ percentage, totalTracked }) => {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const tickCount = 60;
  const circumference = 2 * Math.PI * radius;
  const filledOffset = circumference - (circumference * percentage) / 100;

  // Generate tick marks
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360 - 90; // Start from top
    const rad = (angle * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const outerR = radius + 12;
    const innerR = isMajor ? radius + 4 : radius + 7;
    return {
      x1: cx + Math.cos(rad) * innerR,
      y1: cy + Math.sin(rad) * innerR,
      x2: cx + Math.cos(rad) * outerR,
      y2: cy + Math.sin(rad) * outerR,
      isMajor,
    };
  });

  // Cardinal compass points at N, E, S, W
  const cardinals = ['N', 'E', 'S', 'W'];
  const cardinalAngles = [-90, 0, 90, 180];
  const cardinalR = radius + 22;

  // Needle indicator at the percentage position
  const needleAngle = ((percentage / 100) * 360 - 90) * (Math.PI / 180);
  const needleTipR = radius + 10;
  const needleBaseR = radius - 10;
  const needleTipX = cx + Math.cos(needleAngle) * needleTipR;
  const needleTipY = cy + Math.sin(needleAngle) * needleTipR;
  const needleBaseX = cx + Math.cos(needleAngle) * needleBaseR;
  const needleBaseY = cy + Math.sin(needleAngle) * needleBaseR;
  // Perpendicular offset for needle width
  const perpAngle = needleAngle + Math.PI / 2;
  const needleWidth = 3;
  const leftX = cx + Math.cos(needleAngle) * (radius - 4) + Math.cos(perpAngle) * needleWidth;
  const leftY = cy + Math.sin(needleAngle) * (radius - 4) + Math.sin(perpAngle) * needleWidth;
  const rightX = cx + Math.cos(needleAngle) * (radius - 4) - Math.cos(perpAngle) * needleWidth;
  const rightY = cy + Math.sin(needleAngle) * (radius - 4) - Math.sin(perpAngle) * needleWidth;

  if (totalTracked === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={6}
          />
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="hsl(var(--muted-foreground) / 0.3)"
              strokeWidth={t.isMajor ? 1.5 : 0.75}
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-muted-foreground text-2xl font-display">—</text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">On Time</text>
        </svg>
        <p className="text-sm text-muted-foreground text-center">Complete prayers to see your on-time stats</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={6}
        />

        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={filledOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? 'hsl(var(--foreground) / 0.5)' : 'hsl(var(--muted-foreground) / 0.3)'}
            strokeWidth={t.isMajor ? 1.5 : 0.75}
          />
        ))}

        {/* Cardinal labels */}
        {cardinals.map((label, i) => {
          const rad = (cardinalAngles[i] * Math.PI) / 180;
          return (
            <text key={label}
              x={cx + Math.cos(rad) * cardinalR}
              y={cy + Math.sin(rad) * cardinalR + 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-medium"
            >
              {label}
            </text>
          );
        })}

        {/* Needle */}
        <polygon
          points={`${needleTipX},${needleTipY} ${leftX},${leftY} ${rightX},${rightY}`}
          className="fill-primary"
        />
        {/* Needle center dot */}
        <circle cx={cx} cy={cy} r={4} className="fill-primary" />
        <circle cx={cx} cy={cy} r={2} className="fill-primary-foreground" />

        {/* Center percentage */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground font-display text-3xl font-semibold" dominantBaseline="central">
          {percentage}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">
          On Time
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">Based on {totalTracked} prayers tracked</p>
    </div>
  );
};

export default OnTimeMeter;
