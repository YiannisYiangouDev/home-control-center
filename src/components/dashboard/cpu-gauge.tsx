"use client";

interface CpuGaugeProps {
  value: number;
  size?: number;
  label?: string;
  color?: string;
  unit?: string;
  maxValue?: number;
}

export function CpuGauge({
  value,
  size = 120,
  label = "CPU",
  color = "#00b4d8",
  unit = "%",
  maxValue = 100,
}: CpuGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(value, maxValue) / maxValue) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(220 15% 15%)"
            strokeWidth={8}
          />
          {/* Value ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="metric-value text-2xl font-bold text-text-primary">
            {Math.round(value)}
          </span>
          <span className="text-xs text-text-muted">{unit}</span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-text-secondary">{label}</span>
      )}
    </div>
  );
}
