# Updating Home Control Center

## Standard Update

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild and restart
docker compose build app
docker compose up -d

# The entrypoint script automatically runs database migrations
```

## Major Version Updates

For major version updates, check the release notes for breaking changes:

```bash
# 1. Backup database first!
docker exec hcc-mysql mysqldump -u root -p home_control_center > backup_before_update.sql

# 2. Pull and rebuild
git pull origin main
docker compose build --no-cache app

# 3. Restart
docker compose up -d

# 4. Verify
docker compose logs -f app
```

## Rollback

```bash
# 1. Revert to previous version
git checkout <previous-tag>

# 2. Rebuild
docker compose build app

# 3. Restore database if needed
docker exec -i hcc-mysql mysql -u root -p home_control_center < backup_before_update.sql

# 4. Restart
docker compose up -d
```
