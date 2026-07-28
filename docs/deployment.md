# Home Control Center — Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- A domain name (optional, recommended for HTTPS)
- At least 2 GB RAM for the stack

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo> && cd home-control-center

# 2. Copy and edit environment variables
cp .env.example .env
# Edit .env with your values (especially AUTH_SECRET, ENCRYPTION_KEY, passwords)

# 3. Generate secrets
openssl rand -base64 32  # For AUTH_SECRET
openssl rand -hex 32     # For ENCRYPTION_KEY

# 4. Build and start
docker compose up -d

# 5. Check logs
docker compose logs -f app

# 6. Open browser
# Navigate to http://localhost:3000/setup to create your admin account
```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Random 32-byte base64 secret for JWT signing |
| `ENCRYPTION_KEY` | 64-char hex string for AES-256 encryption |
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `MYSQL_PASSWORD` | MySQL app user password |

### Optional Integrations

| Variable | Description |
|----------|-------------|
| `UNRAID_URL` | Your Unraid server URL (e.g., `https://unraid.local`) |
| `UNRAID_API_KEY` | Unraid API key (Settings → Management Access → API) |
| `NEXTCLOUD_URL` | Your Nextcloud instance URL |
| `NEXTCLOUD_USERNAME` | Admin username |
| `NEXTCLOUD_APP_PASSWORD` | App password (Settings → Security → Devices) |
| `RESEND_API_KEY` | Resend.com API key for email alerts |

## Production HTTPS

For HTTPS, put a reverse proxy (nginx, Caddy, Traefik) in front:

```nginx
server {
    listen 443 ssl http2;
    server_name hcc.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Updating

See [updating.md](./updating.md) for update instructions.
