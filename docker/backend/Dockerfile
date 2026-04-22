# Stage 1: Composer dependencies
FROM composer:2.8-alpine AS composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative


# Stage 2: Build Vite assets
FROM node:22-alpine AS node

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
COPY --from=composer /app/vendor ./vendor

# Build Vite assets (if any Laravel Vite assets exist)
RUN if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then npm run build; fi


# Stage 3: PHP-FPM Runtime
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    mysql-client \
    freetype \
    libpng \
    libjpeg-turbo \
    freetype-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        zip \
        gd \
        opcache \
        intl \
        mbstring \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del freetype-dev libpng-dev libjpeg-turbo-dev

# Copy PHP configuration
COPY docker/backend/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/backend/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/backend/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www/html

# Copy application files
COPY --chown=www-data:www-data . .
COPY --from=composer --chown=www-data:www-data /app/vendor ./vendor
COPY --from=node --chown=www-data:www-data /app/public ./public

# Create required directories
RUN mkdir -p \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Laravel optimizations (will run in entrypoint if .env exists)
COPY docker/backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php-fpm -t || exit 1

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
