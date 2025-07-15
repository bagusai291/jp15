
# Deployment Guide - Injapan Food ke Niagahoster VPS

## Prerequisites
- VPS Niagahoster dengan spesifikasi: 1 vCPU, 4GB RAM, 50GB NVMe
- Domain name sudah pointing ke IP VPS
- SSH access ke VPS

## Step 1: Server Setup

1. **Login ke VPS via SSH:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Create non-root user:**
   ```bash
   adduser deployer
   usermod -aG sudo deployer
   su - deployer
   ```

3. **Run server setup script:**
   ```bash
   # Upload server-setup.sh to VPS
   chmod +x server-setup.sh
   ./server-setup.sh
   ```

## Step 2: Build Application Locally

1. **Build for production:**
   ```bash
   # Di komputer lokal
   chmod +x build-for-production.sh
   ./build-for-production.sh
   ```

2. **Upload build ke VPS:**
   ```bash
   scp injapan-food-build.tar.gz deployer@your-vps-ip:~/
   ```

## Step 3: Deploy Application

1. **Extract build di VPS:**
   ```bash
   # Di VPS
   cd /var/www/injapan-food
   tar -xzf ~/injapan-food-build.tar.gz --strip-components=1
   ```

2. **Configure Nginx:**
   ```bash
   # Upload nginx.conf dan deploy.sh ke VPS
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Setup SSL Certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Step 4: Update External Services

1. **Supabase Configuration:**
   - Login ke Supabase Dashboard
   - Go to Authentication > URL Configuration
   - Add your domain ke allowed origins
   - Update Site URL ke https://yourdomain.com

2. **Firebase Configuration:**
   - Login ke Firebase Console
   - Go to Authentication > Settings > Authorized domains
   - Add your domain

## Step 5: DNS Configuration

1. **Update DNS Records:**
   ```
   A Record: @ -> your-vps-ip
   A Record: www -> your-vps-ip
   ```

## Step 6: Testing

1. **Test website functionality:**
   - Buka https://yourdomain.com
   - Test login/register
   - Test product catalog
   - Test cart functionality
   - Test language switching

2. **Monitor logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

## Step 7: Ongoing Maintenance

1. **Setup automatic SSL renewal:**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Setup backup:**
   ```bash
   # Create backup script for your application files
   ```

## Troubleshooting

### Common Issues:

1. **SSL Certificate Error:**
   - Pastikan domain sudah pointing ke VPS
   - Check DNS propagation

2. **Authentication Issues:**
   - Verify Supabase/Firebase domain settings
   - Check browser console for CORS errors

3. **Performance Issues:**
   - Enable Nginx gzip compression (sudah included di config)
   - Monitor VPS resources dengan `htop`

### Useful Commands:

```bash
# Check Nginx status
sudo systemctl status nginx

# Reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx

# Check SSL certificate
sudo certbot certificates

# Monitor system resources
htop
df -h
free -h
```

## Support

Jika ada masalah during deployment, check:
1. Nginx error logs: `/var/log/nginx/error.log`
2. System logs: `journalctl -xe`
3. SSL certificate status: `sudo certbot certificates`
