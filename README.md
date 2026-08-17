# Home Control Center

Self-hosted home server command center — PWA dashboard for monitoring Unraid, Nextcloud, Home Assistant, services, and alerts. Next.js 15 (App Router), NextAuth v5 (JWT sessions), Prisma + MySQL 8, Docker Compose stack with worker + Prometheus.

## Quick Start (clone → run)

Requires: Docker + Docker Compose, 2 GB+ RAM.

```bash
git clone git@github.com:YiannisYiangouDev/home-control-center.git
cd home-control-center

# 1. Configure environment
cp .env.example .env   # then edit .env — see "Required secrets" below

# 2. Build and start the stack (app + mysql + worker + prometheus)
docker compose up -d --build

# 3. Create the admin account (first run only)
docker exec -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='a-strong-password-12+chars' hcc-app npx tsx prisma/seed.ts

# 4. Open it
open http://localhost:3030
```

On first boot the app container automatically applies DB migrations (`prisma migrate deploy`), so the schema is created for you. The seed step above is the only manual one.

### Updating to a newer version

```bash
git pull && docker compose up -d --build
```

See `docs/updating.md` for details.

## Required secrets (generate fresh, never use the placeholders)

The app refuses to start with weak/placeholder secrets (validated at boot):

```bash
openssl rand -base64 32   # AUTH_SECRET — JWT signing
openssl rand -base64 32   # WORKER_API_SECRET — worker bearer token for /api/cron and /api/metrics
openssl rand -hex 32      # ENCRYPTION_KEY — AES-256 key for server credentials at rest
openssl rand -base64 32   # MYSQL_ROOT_PASSWORD
openssl rand -base64 32   # MYSQL_PASSWORD
```

## Optional integrations

| Feature | Variables |
|---|---|
| Unraid metrics / containers | `UNRAID_URL`, `UNRAID_API_KEY` |
| Nextcloud status | `NEXTCLOUD_URL`, `NEXTCLOUD_USERNAME`, `NEXTCLOUD_APP_PASSWORD` |
| Notification webhooks | `DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`, or `GOTIFY_URL` + `GOTIFY_APP_TOKEN` |
| Email alerts (Resend) | `RESEND_API_KEY`, `EMAIL_FROM` |
| PWA push | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (generate with `npx web-push generate-vapid-keys`) |

`ALLOWED_INTERNAL_HOSTS` — comma-separated LAN hosts the app may poll (e.g. your server IPs). Loopback, link-local, cloud-metadata, and all private ranges are blocked by default; anything not allow-listed here is unreachable from the polling code (SSRF guard).

## Architecture

- **app** — Next.js 15 on port **3030** (LAN). Healthcheck at `/api/health`.
- **mysql** — MySQL 8, data in the `mysql_data` volume, not exposed to the host.
- **worker** — polls `/api/cron/poll-services` with a `WORKER_API_SECRET` bearer token on `POLLING_INTERVAL` (default 60 s).
- **prometheus** — scrapes `/api/metrics` (bearer-protected), admin UI bound to `127.0.0.1:9090` only.

Roles: `ADMIN` (manage servers/services/settings, optional TOTP 2FA) and `VIEWER` (read-only dashboard).

## Backup

See `docs/backup-restore.md` — daily `mysqldump` of the `mysql_data` volume is the single source of truth.

## Security notes

- All secrets are validated at boot; the app refuses to run with placeholder values.
- `BYPASS_AUTH=true` is a **development-only** escape hatch — the app hard-fails at startup if it's set in production.
- Server credentials are encrypted at rest with AES-256-GCM (`ENCRYPTION_KEY`).
- Auth endpoints are rate-limited per IP; admin accounts get account lockout + optional TOTP 2FA.