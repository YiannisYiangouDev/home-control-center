#!/bin/sh
set -e

echo "🏠 Home Control Center — Starting up..."

# Run database migrations
echo "📦 Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "❌ Database migration failed — aborting startup." >&2
  exit 1
fi

echo "🚀 Starting application..."
exec "$@"
