// Dashboard widget registry.
// A "widget" is a named top-level block on the home page. The order/hidden
// state is persisted per user in `settings.dashboard_layout` (see actions/layout.ts).

export const WIDGETS = {
  status:    { title: "Status cards",    span: "full" as const },
  services:  { title: "Services",        span: "full" as const },
  climate:   { title: "Climate",         span: "full" as const },
  charts:    { title: "CPU / RAM charts", span: "full" as const },
  storage:   { title: "Storage overview", span: "md" as const },
  alerts:    { title: "Recent alerts",   span: "md" as const },
  shortcuts: { title: "Shortcuts",       span: "md" as const },
  network:   { title: "Network",         span: "full" as const },
  weather:   { title: "Weather",         span: "md" as const },
  containers:{ title: "Containers",      span: "md" as const },
  nextcloud: { title: "Nextcloud quota", span: "md" as const },
} as const;

export type WidgetId = keyof typeof WIDGETS;

export const DEFAULT_LAYOUT: WidgetId[] = [
  "status",
  "services",
  "climate",
  "charts",
  "storage",
  "alerts",
  "shortcuts",
  "network",
  "weather",
  "containers",
  "nextcloud",
];

// Merge a persisted layout with defaults: keep valid default widgets, apply
// the saved order and mark missing ones hidden (so newly added widgets still
// appear when the user has never saved a layout).
export function resolveLayout(saved?: { order?: string[]; hidden?: string[] } | null): {
  order: WidgetId[];
  hidden: Set<WidgetId>;
} {
  const known = new Set(Object.keys(WIDGETS) as WidgetId[]);
  const hidden = new Set<WidgetId>(
    (saved?.hidden ?? [])
      .filter((h): h is WidgetId => known.has(h as WidgetId))
  );

  let order: WidgetId[];
  if (saved?.order && saved.order.length > 0) {
    order = saved.order
      .filter((w): w is WidgetId => known.has(w as WidgetId))
      .filter((w) => !hidden.has(w));
  } else {
    order = DEFAULT_LAYOUT.filter((w) => !hidden.has(w));
  }

  // Append any defaults not present (and not hidden) so nothing silently vanishes.
  for (const w of DEFAULT_LAYOUT) {
    if (!order.includes(w) && !hidden.has(w)) order.push(w);
  }

  return { order, hidden };
}