#!/bin/sh
set -e

echo "🏠 Home Control Center — Starting up..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "⚠️  Migrations skipped (database may not be ready yet)"

echo "🚀 Starting application..."
exec "$@"
