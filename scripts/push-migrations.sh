#!/bin/bash
# Push local migrations to Supabase production

set -e

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set"
    exit 1
fi

echo "⚠️  This will apply migrations to your PRODUCTION database"
read -p "Are you sure you want to continue? (yes/no) " -n 3 -r
echo
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Push cancelled"
    exit 1
fi

echo "🔄 Pushing migrations to Supabase production..."

supabase push --linked

echo "✅ Migrations pushed successfully!"
