#!/bin/bash
# Idempotent setup script for ShopSmart

set -e

echo "🚀 Starting ShopSmart setup..."

# 1. Server Setup
echo "📦 Setting up backend..."
cd server
npm ci
npx prisma generate
npx prisma migrate deploy

# Seed if DB is empty or just initialized
# We can just run the seed script; our upserts make it idempotent!
node prisma/seed.js
cd ..

# 2. Client Setup
echo "🎨 Setting up frontend..."
cd client
npm ci
npm run build
cd ..

echo "✅ Setup complete! You can now start the application."
echo "Use 'pm2 start ecosystem.config.js' for production"
echo "Or run 'npm run dev' in server/ and client/ for development."
