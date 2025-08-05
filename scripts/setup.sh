#!/bin/bash

# BVER Initial Setup Script

echo "🚀 Setting up BVER project..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please fill in your environment variables in .env"
fi

if [ ! -f app/.env.local ]; then
    echo "📝 Creating app/.env.local file..."
    cp app/.env.local app/.env.local.backup 2>/dev/null || true
    echo "⚠️  Please fill in your environment variables in app/.env.local"
fi

# Initialize Supabase (if not already done)
if [ ! -f supabase/config.toml ]; then
    echo "🗄️  Initializing Supabase..."
    cd supabase && npx supabase init --workdir . && cd ..
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Fill in your environment variables in .env and app/.env.local"
echo "2. Set up your Supabase project and run migrations"
echo "3. Run 'npm run dev' to start the development server"