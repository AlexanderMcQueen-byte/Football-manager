#!/bin/bash
# Stop Supabase local development environment

set -e

echo "🛑 Stopping Supabase..."

supabase stop

echo "✅ Supabase stopped successfully!"
