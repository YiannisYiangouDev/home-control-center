# Backup & Restore

## Database Backup

### Automatic Backup Script

```bash
#!/bin/bash
# backup.sh — Run daily via cron
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="hcc-mysql"

docker exec $CONTAINER mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" home_control_center | gzip > "$BACKUP_DIR/hcc_backup_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "hcc_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: hcc_backup_$DATE.sql.gz"
```

Add to crontab:
```
0 2 * * * /path/to/backup.sh
```

### Manual Backup

```bash
docker exec hcc-mysql mysqldump -u root -p home_control_center > backup.sql
```

## Restore

```bash
# 1. Stop the app
docker compose stop app worker

# 2. Restore database
docker exec -i hcc-mysql mysql -u root -p home_control_center < backup.sql

# 3. Restart
docker compose up -d
```

## Backup Encryption Keys

**CRITICAL**: Back up your `ENCRYPTION_KEY` from `.env`. Without it, encrypted server credentials cannot be decrypted.

```bash
# Save securely (e.g., password manager)
grep ENCRYPTION_KEY .env
```
