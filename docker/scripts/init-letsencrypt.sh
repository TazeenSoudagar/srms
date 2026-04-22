#!/bin/bash

# init-letsencrypt.sh - Initialize Let's Encrypt SSL certificates
# Usage: ./init-letsencrypt.sh yourdomain.com admin@yourdomain.com

set -e

# Check arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2
STAGING=0 # Set to 1 for testing

# Paths
DOCKER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CONF_DIR="$DOCKER_DIR/certbot/conf"
WWW_DIR="$DOCKER_DIR/certbot/www"
NGINX_CONF="$DOCKER_DIR/nginx/default.conf"
SSL_CONF="$DOCKER_DIR/nginx/ssl.conf"

echo "=== Let's Encrypt SSL Initialization ==="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Staging: $STAGING"
echo ""

# Create directories
mkdir -p "$CONF_DIR/live/$DOMAIN"
mkdir -p "$WWW_DIR"

# Update domain in nginx configs
echo "Updating nginx configuration with domain: $DOMAIN"
sed -i.bak "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$NGINX_CONF"
sed -i.bak "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" "$SSL_CONF"

# Check if certificates already exist
if [ -d "$CONF_DIR/live/$DOMAIN" ] && [ -f "$CONF_DIR/live/$DOMAIN/fullchain.pem" ]; then
    echo "Certificates already exist for $DOMAIN"
    read -p "Do you want to renew them? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without renewal."
        exit 0
    fi
    RENEW=1
else
    RENEW=0
fi

# Generate DH parameters if not exist
if [ ! -f "$CONF_DIR/ssl-dhparams.pem" ]; then
    echo "Generating DH parameters (this may take a few minutes)..."
    openssl dhparam -out "$CONF_DIR/ssl-dhparams.pem" 2048
fi

# Uncomment dhparam line in ssl.conf
sed -i 's/# ssl_dhparam/ssl_dhparam/' "$SSL_CONF"

if [ $RENEW -eq 0 ]; then
    # Create dummy certificates for initial nginx start
    echo "Creating dummy certificates for $DOMAIN..."
    CERT_DIR="$CONF_DIR/live/$DOMAIN"
    mkdir -p "$CERT_DIR"

    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=$DOMAIN"

    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/chain.pem" \
        -subj "/CN=$DOMAIN"
fi

# Start nginx
echo "Starting nginx..."
cd "$(dirname "$DOCKER_DIR")"
docker compose up -d nginx

echo "Waiting for nginx to start..."
sleep 5

# Remove dummy certificates
if [ $RENEW -eq 0 ]; then
    echo "Removing dummy certificates..."
    rm -rf "$CONF_DIR/live/$DOMAIN"
fi

# Request real certificates
echo "Requesting Let's Encrypt certificates..."

STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
    STAGING_ARG="--staging"
    echo "Using Let's Encrypt staging server (for testing)"
fi

docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $STAGING_ARG \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

# Reload nginx with real certificates
echo "Reloading nginx with real certificates..."
docker compose exec nginx nginx -s reload

echo ""
echo "=== SSL Certificate Installation Complete ==="
echo "Certificates are located in: $CONF_DIR/live/$DOMAIN"
echo "Automatic renewal is configured via certbot container."
echo ""
echo "Your site should now be accessible at:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "Test SSL configuration at:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
