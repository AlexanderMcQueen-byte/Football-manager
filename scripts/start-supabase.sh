#!/bin/bash
# Start Supabase local development environment
# Uses Docker Compose to run Supabase services

set -e

echo "🚀 Starting Supabase..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Supabase
supabase start

echo "✅ Supabase started successfully!"
echo ""
echo "📌 Access points:"
echo "   API URL: http://localhost:54321"
echo "   Studio: http://localhost:54323"
echo "   Database: postgresql://postgres:postgres@localhost:5432/postgres"
echo ""
echo "💡 Tip: View logs with: docker-compose -f supabase/docker-compose.yml logs -f"
echo ""
