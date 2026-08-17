#!/bin/bash
# Initialize and start local Supabase development environment
# Run this script once to set up everything

set -e

echo "================================================"
echo "  eFootball Organizer - Local Supabase Setup"
echo "================================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Please install pnpm"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Setup environment
echo "📝 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local (review and update if needed)"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Create directories
echo "📁 Creating necessary directories..."
mkdir -p supabase/migrations
mkdir -p scripts
echo "✅ Directories created"
echo ""

# Update dependencies
echo "📦 Installing dependencies..."
cd lib/db
pnpm install
cd ../..
echo "✅ Dependencies installed"
echo ""

# Start Docker containers
echo "🐳 Starting PostgreSQL container..."
docker-compose -f docker-compose.supabase.yml up -d
echo "✅ PostgreSQL started"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Test connection
if psql postgresql://postgres:postgres@localhost:5432/postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database not responding yet, retrying..."
    sleep 5
fi
echo ""

# Push schema
echo "📊 Pushing schema to database..."
cd lib/db
pnpm run push
cd ../..
echo "✅ Schema applied"
echo ""

echo "================================================"
echo "  ✅ Setup Complete!"
echo "================================================"
echo ""
echo "📌 What's running:"
echo "   - PostgreSQL on localhost:5432"
echo "   - pgAdmin on http://localhost:5050"
echo ""
echo "🚀 Next steps:"
echo "   1. Update .env.local with any custom values"
echo "   2. Run 'pnpm install' to install all dependencies"
echo "   3. Run 'pnpm run dev' to start development server"
echo ""
echo "📚 For more info, see SUPABASE_SETUP.md"
echo ""
