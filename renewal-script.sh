#!/bin/sh

mkdir -p /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

chmod -R 755 /etc/letsencrypt /data/letsencrypt /var/lib/letsencrypt
find /etc/letsencrypt -type f -exec chmod 644 {} +

while true; do
  echo "Checking..."
  certbot renew --webroot -w /usr/share/nginx/html
  if [ $? -eq 0 ]; then
    tee -a /var/log/letsencrypt/renewal.log
    chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
    chmod 644 /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem
    chmod 644 /etc/letsencrypt/live/condots.duckdns.org/privkey.pem
  else
    echo "Certificate renewal failed" | tee -a /var/log/letsencrypt/renewal.log
  fi
  sleep 12h
done
