#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SERVER_IP="${DEPLOY_SERVER_IP:-167.71.191.234}"
SERVER_USER="${DEPLOY_USER:-root}"
SSH_KEY="${SSH_KEY_PATH:-~/.ssh/a-icon-deploy}"
DOMAIN="${TARGET_DOMAIN:-credchit.iffuso.com}"
EMAIL="${SSL_EMAIL:-admin@iffuso.com}"

echo "🔐 Initializing SSL for $DOMAIN..."

ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << ENDSSH
# Get SSL certificate using certbot
certbot certonly --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive

# Reload nginx
systemctl reload nginx

echo "✅ SSL certificate installed for $DOMAIN"
ENDSSH

echo "🎉 SSL initialization complete!"

