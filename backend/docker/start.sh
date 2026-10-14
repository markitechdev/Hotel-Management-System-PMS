#!/bin/sh
set -e

# Hosts like Render tell the container which port to listen on through $PORT.
PORT="${PORT:-10000}"
sed -ri "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

php artisan config:cache
php artisan route:cache

# Creates hotel_rooms (and Laravel's own tables) in the cloud database. Safe to run on every start:
# migrations that already ran are skipped, so existing rooms are never touched.
php artisan migrate --force

# Anything the commands above wrote must stay writable by Apache's user.
chown -R www-data:www-data storage bootstrap/cache

exec apache2-foreground
