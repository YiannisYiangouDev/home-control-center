# Home Control Center — Custom Features Guide

This guide documents the custom metrics monitoring, notification webhooks, alert rules, and layout features added to your Home Control Center (HCC) workspace.

---

## 1. Unified Webhook Notifications
We added a centralized notifications dispatcher in `src/lib/notifications.ts` that triggers simultaneously across three messaging platforms:

*   **Discord Webhooks**: Outputs rich embeds colored dynamically by status (Green for recoveries, Red for failures).
*   **Telegram Bots**: Sends markdown alerts decorated with status emojis (🔴 for alert, 🟢 for recovery).
*   **Gotify Push Server**: Pushes native alerts directly to your self-hosted Gotify instance. Sends failures/warnings with high priority (`8`) and recoveries with normal priority (`5`).

### Environment Variables
Configure these variables in your `.env` to enable notifications:
```bash
# Discord Webhook
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Telegram Configuration
TELEGRAM_BOT_TOKEN="123456789:ABCdefGhI..."
TELEGRAM_CHAT_ID="-100123456789"

# Gotify Configuration
GOTIFY_URL="http://192.168.0.200:8070"
GOTIFY_APP_TOKEN="your_app_token_here"
```

---

## 2. On-Demand Active Refresh Hooks
To prevent page reloads, we implemented a generic, client-side `<RefreshButton />` using React's `useTransition` and Next.js `router.refresh()`:

*   **Unraid Sub-Dashboards**: Placed inside Unraid Overview, Storage, and Docker pages to reload system structures, metrics, and temperatures.
*   **Active Services Polling**: The Refresh button on the Services page triggers a secure, parallelized Server Action (`pollAllServices()`) to fetch live statuses before refreshing the dashboard grid.

---

## 3. Custom Monitoring Alert Rules
Background sync checkers actively monitor system behaviors and generate database alert logs alongside dispatching push alerts:

### Service Outage Warning
*   **Trigger**: Service response status differs from `expectedStatus` (e.g. returns 500 or times out).
*   **Severity**: `CRITICAL`.

### Service Latency Alert
*   **Trigger**: An online service response latency exceeds **`2500ms`**.
*   **Severity**: `WARNING`.
*   **Resolution**: Auto-resolves when latency drops back under 2.5s, or if the service drops completely offline (preventing duplicate alerts).

### Unraid Storage Capacity Warn
*   **Trigger**: Unraid array storage utilization exceeds **`90%`**.
*   **Severity**: `WARNING`.
*   **Resolution**: Auto-resolves when disk utilization falls below `90%`.

### Unraid Disk Temperature Alert
*   **Trigger**: Any array drive SMART temperature exceeds **`45°C`**.
*   **Severity**: `CRITICAL`.
*   **Resolution**: Auto-resolves when drive cools down.

### Unraid Critical Docker Container Crash
*   **Trigger**: Any container defined in `MONITORED_CONTAINERS` stops running.
*   **Severity**: `CRITICAL`.
*   **Resolution**: Auto-resolves once the container starts running again.
*   **Configuration**:
    ```bash
    MONITORED_CONTAINERS="plex,homeassistant,nextcloud"
    ```

---

## 4. RAM Calculation Fixes
*   **Issue**: Raw memory calculations initially reported cache and buffer allocations as "Used", leading to inflated RAM readings (~98% used).
*   **Fix**: Modified calculation in `DashboardClient.tsx` and `UnraidOverviewClient.tsx` to subtract `available` memory from `total` memory:
    ```typescript
    const usedGB = (Number(mem.total) - Number(mem.available || mem.free)) / (1024 * 1024 * 1024);
    ```
*   **UI Enhancement**: Exposed the formatted active memory usage label (`13.0 / 16 GB`) directly underneath the RAM CpuGauge circle.
