#!/bin/sh
chmod 755 /etc/letsencrypt/live
chmod 755 /etc/letsencrypt/archive
chmod 644 /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem
chmod 644 /etc/letsencrypt/live/condots.duckdns.org/privkey.pem
chmod -R 755 /usr/share/nginx/html
nginx -g 'daemon off;'
