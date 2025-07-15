
#!/bin/bash

# Deployment script for Injapan Food to Niagahoster VPS
# Run this script on your VPS server

set -e

echo "🚀 Starting deployment process..."

# Variables
APP_NAME="injapan-food"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
DOMAIN="injapanfood.com"

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Install Node.js (if not already installed)
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally (if not already installed)
echo "🔧 Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Nginx (if not already installed)
echo "🌐 Checking Nginx installation..."
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

# Copy nginx configuration
echo "⚙️ Configuring Nginx..."
sudo cp nginx.conf $NGINX_CONF
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install Certbot for SSL (if not already installed)
echo "🔒 Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
fi

echo "📋 Next steps to complete deployment:"
echo "1. Upload your dist/ folder to $APP_DIR"
echo "2. Run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Update your DNS records to point to this server's IP"
echo "4. Update Supabase allowed origins to include your domain"
echo "5. Test the deployment"

echo "✅ Server setup completed!"
