#!/bin/sh

log_message() {
  echo "[$(date +"%F %T")] $1"
}

chmod 755 /etc/letsencrypt/live
chmod 755 /etc/letsencrypt/archive
chmod 644 /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem
chmod 644 /etc/letsencrypt/live/condots.duckdns.org/privkey.pem
chmod -R 755 /usr/share/nginx/html

log_message "Starting nginx"
nginx -g 'daemon off;' &
NGINX_PID=$!

log_message "Monitoring certificate files and reloading nginx when they change"
while true; do
  if [ -f /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem.updated ]; then
    log_message "Certificate files have been updated, reloading nginx"
    nginx -s reload
    rm /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem.updated
    log_message "Nginx reloaded"
  fi
  sleep 5
done &

# Wait for nginx process
wait $NGINX_PID
