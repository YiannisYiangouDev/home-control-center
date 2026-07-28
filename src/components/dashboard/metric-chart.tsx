"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface MetricChartProps {
  title: string;
  icon?: React.ReactNode;
  data: Record<string, unknown>[];
  dataKey: string;
  secondaryDataKey?: string;
  color?: string;
  secondaryColor?: string;
  unit?: string;
  maxValue?: number;
  compact?: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; color: string; dataKey: string }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card-static px-3 py-2 text-xs">
      <p className="text-text-muted mb-1">
        {label
          ? format(new Date(label), "MMM d, HH:mm")
          : ""}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="metric-value" style={{ color: entry.color }}>
          {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
          {unit}
        </p>
      ))}
    </div>
  );
}

export function MetricChart({
  title,
  icon,
  data,
  dataKey,
  secondaryDataKey,
  color = "#00b4d8",
  secondaryColor = "#34d399",
  unit = "%",
  maxValue,
  compact,
}: MetricChartProps) {
  return (
    <div className={compact ? "" : "glass-card-static p-5"}>
      {title && !compact && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-text-muted">{icon}</span>}
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        </div>
      )}
      <div className={compact ? "h-full" : "h-56"}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              {secondaryDataKey && (
                <linearGradient
                  id={`grad-${secondaryDataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220 15% 15%)"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(val) => {
                try {
                  return format(new Date(val), "HH:mm");
                } catch {
                  return "";
                }
              }}
              tick={{ fill: "hsl(215 15% 45%)", fontSize: 10 }}
              axisLine={{ stroke: "hsl(220 15% 15%)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={maxValue ? [0, maxValue] : ["auto", "auto"]}
              tick={{ fill: "hsl(215 15% 45%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}${unit === "%" ? "%" : ""}`}
            />
            <Tooltip
              content={<CustomTooltip unit={unit} />}
              cursor={{ stroke: "hsl(220 15% 25%)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${dataKey})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: "hsl(222 35% 10%)",
                strokeWidth: 2,
              }}
            />
            {secondaryDataKey && (
              <Area
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={secondaryColor}
                strokeWidth={2}
                fill={`url(#grad-${secondaryDataKey})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: secondaryColor,
                  stroke: "hsl(222 35% 10%)",
                  strokeWidth: 2,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
