"use client";

interface StorageBarProps {
  label: string;
  used: number;
  total: number;
  unit?: string;
  color?: string;
}

export function StorageBar({
  label,
  used,
  total,
  unit = "TB",
  color = "#00b4d8",
}: StorageBarProps) {
  const percentage = Math.min((used / total) * 100, 100);
  const isHigh = percentage > 85;
  const barColor = isHigh ? "#f87171" : color;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="metric-value text-text-muted">
          {used} / {total} {unit}
        </span>
      </div>
      <div className="relative h-2 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${barColor}80, ${barColor})`,
            boxShadow: `0 0 8px ${barColor}40`,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-text-muted">
        <span>{percentage.toFixed(1)}% used</span>
        <span>{(total - used).toFixed(1)} {unit} free</span>
      </div>
    </div>
  );
}
