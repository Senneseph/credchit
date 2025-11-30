#!/bin/bash
set -e

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SERVER_IP="${DEPLOY_SERVER_IP:-167.71.191.234}"
SERVER_USER="${DEPLOY_USER:-root}"
SSH_KEY="${SSH_KEY_PATH:-~/.ssh/a-icon-deploy}"
REMOTE_DIR="/opt/credchit"
DOMAIN="${TARGET_DOMAIN:-credchit.iffuso.com}"

echo "🚀 Deploying Credchit to $SERVER_IP..."

# Create remote directory
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_DIR"

# Copy necessary files
echo "📦 Copying files..."
rsync -avz --progress \
    -e "ssh -i $SSH_KEY" \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'terraform/.terraform' \
    --exclude 'terraform/*.tfstate*' \
    --exclude 'frontend/.angular' \
    ./ "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# Copy production env file if it exists
if [ -f .env.production ]; then
    scp -i "$SSH_KEY" .env.production "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env"
else
    scp -i "$SSH_KEY" .env "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env"
fi

# Deploy on server
echo "🐳 Starting containers..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << ENDSSH
cd /opt/credchit

# Ensure Docker is running
systemctl is-active --quiet docker || systemctl start docker

# Pull latest images and rebuild
docker compose -f docker-compose.prod.yml build --no-cache

# Start services
docker compose -f docker-compose.prod.yml up -d

# Show status
docker compose -f docker-compose.prod.yml ps

# Setup nginx config for host
echo "🔧 Setting up nginx..."
cp nginx/credchit.iffuso.com /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/credchit.iffuso.com /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

echo "✅ Deployment complete!"
ENDSSH

echo "🎉 Credchit deployed successfully!"
echo "🌐 Visit https://$DOMAIN"

