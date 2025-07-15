#!/bin/bash

# Build script for production deployment
set -e

echo "🏗️ Building Injapan Food for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run production build
echo "🔨 Creating production build..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf injapan-food-build.tar.gz dist/

echo "✅ Production build completed!"
echo "📁 Build files are in the 'dist' directory"
echo "📦 Deployment package: injapan-food-build.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Upload injapan-food-build.tar.gz to your VPS server"
echo "2. Extract it to /var/www/injapan-food/"
echo "3. Run the deploy.sh script on your server"