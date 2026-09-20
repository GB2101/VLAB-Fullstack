FROM php:8.4-cli-alpine

# 2. Copy Composer from the official composer image
COPY --from=composer:2.10 /usr/bin/composer /usr/bin/composer

# Set the working directory first
WORKDIR /var/www/html

# Install dependencies
RUN apk add --no-cache \
    build-base \
    libpng-dev \
    jpeg-dev \
    libwebp-dev \
    libxpm-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    bash \
    fcgiwrap \
    libmcrypt-dev \
    oniguruma-dev \
    postgresql-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install -j$(nproc) pdo_pgsql mbstring zip exif pcntl bcmath opcache

# Copy all project files into the container
COPY . .

# Install PHP dependencies via Composer
RUN composer install --no-interaction --optimize-autoloader

# Fix permissions
RUN chown -R www-data:www-data /var/www/html
USER www-data

EXPOSE 8000

# 3. Use standard Artisan serve to run the app
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
