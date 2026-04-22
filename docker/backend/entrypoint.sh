#!/bin/sh
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until mysql -h"${DB_HOST:-mysql}" -u"${DB_USERNAME:-root}" -p"${DB_PASSWORD}" -e "SELECT 1" > /dev/null 2>&1; do
    sleep 2
done
echo "MySQL is ready!"

# Create storage link if not exists
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link
fi

# Run Laravel optimizations if .env exists
if [ -f /var/www/html/.env ]; then
    echo "Running Laravel optimizations..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Execute the main command
exec "$@"
