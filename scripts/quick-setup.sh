#!/bin/bash
# Quick setup for Supabase in less than 5 minutes

set -e

echo "🚀 Quick Supabase Setup (5 minutes)"
echo "===================================="
echo ""

# Step 1: Environment setup
echo "Step 1: Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
fi
echo "✅ Environment configured"

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
cd lib/db
pnpm install > /dev/null 2>&1
cd ../..
echo "✅ Dependencies installed"

# Step 3: Start database
echo ""
echo "Step 3: Starting PostgreSQL database..."
docker-compose -f docker-compose.supabase.yml up -d > /dev/null 2>&1
sleep 3
echo "✅ Database running on localhost:5432"

# Step 4: Apply schema
echo ""
echo "Step 4: Applying database schema..."
cd lib/db
pnpm run push > /dev/null 2>&1
cd ../..
echo "✅ Schema applied"

echo ""
echo "===================================="
echo "✅ Setup Complete! ($(date +%Hh%Mm%Ss))"
echo "===================================="
echo ""
echo "Next steps:"
echo "  1. Update .env.local if needed"
echo "  2. pnpm install"
echo "  3. pnpm run dev"
echo ""
