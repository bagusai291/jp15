
#!/bin/bash

# Server setup script for Ubuntu VPS
# Run this on your fresh Ubuntu VPS

set -e

echo "🖥️ Setting up Ubuntu VPS for Injapan Food..."

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "🔧 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot
echo "🔒 Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create web directory
echo "📁 Creating web directory..."
sudo mkdir -p /var/www/injapan-food
sudo chown $USER:$USER /var/www/injapan-food

# Start and enable services
echo "🚀 Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup PM2 startup
pm2 startup
echo "⚠️ Follow the PM2 startup instructions above if shown"

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your application files"
echo "2. Configure Nginx with your domain"
echo "3. Setup SSL certificate"
echo "4. Deploy your application"
