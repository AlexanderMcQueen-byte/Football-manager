#!/bin/bash
# Pull latest migrations from Supabase production
# Syncs local schema with production

set -e

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set"
    exit 1
fi

echo "🔄 Pulling migrations from Supabase production..."

supabase pull --linked

echo "✅ Migrations pulled successfully!"
echo "📝 Review changes in supabase/migrations/"
echo "💡 Commit the changes to version control"
