#!/bin/bash
# Setup Supabase for local development
# This script initializes Supabase with Docker Compose

set -e

echo "🚀 Setting up Supabase for local development..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        echo "Please install Supabase CLI: https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.local.example..."
    cp .env.local.example .env.local
    echo "⚠️  Please update .env.local with your configuration"
fi

# Initialize Supabase project if not already initialized
if [ ! -d "supabase/.branches" ]; then
    echo "📦 Initializing Supabase project..."
    supabase init
fi

echo "✅ Supabase setup complete!"
echo ""
echo "📌 Next steps:"
echo "   1. Start Supabase: supabase start"
echo "   2. View dashboard: supabase studio"
echo "   3. View logs: docker-compose logs -f"
echo ""
