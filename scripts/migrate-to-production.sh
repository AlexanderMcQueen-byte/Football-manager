#!/bin/bash
# Migrate local Supabase database to production
# WARNING: This only works if both databases use the same schema

set -e

if [ -z "$PRODUCTION_DATABASE_URL" ]; then
    echo "❌ PRODUCTION_DATABASE_URL environment variable is not set"
    exit 1
fi

echo "⚠️  This will migrate your local Supabase data to production"
echo "💾 Make sure you have a backup!"
read -p "Are you sure you want to continue? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Migration cancelled"
    exit 1
fi

echo "🔄 Starting migration..."

# Use pg_dump to export local database
LOCAL_DB="postgresql://postgres:postgres@localhost:5432/postgres"

# Dump schema and data
pg_dump "$LOCAL_DB" --verbose --create --clean --if-exists --single-transaction | \
    psql "$PRODUCTION_DATABASE_URL" --verbose

echo "✅ Migration complete!"
echo "⚠️  Verify all data is correct in production before using"
