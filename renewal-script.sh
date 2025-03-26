#!/bin/sh

log_message() {
  echo "[$(date +"%F %T")] $1" | tee -a /var/log/letsencrypt/renewal.log
}

mkdir -p /var/www/.well-known/acme-challenge
chmod -R 755 /etc/letsencrypt /var/log/letsencrypt /var/www/.well-known
find /etc/letsencrypt -type f -exec chmod 644 {} +

while true; do
  log_message "Checking for certificate renewal..."
  CERT_MTIME_BEFORE=$(stat -c %Y /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem 2>/dev/null || echo "0")
  certbot renew --webroot -w /var/www
  if [ $? -eq 0 ]; then
    CERT_MTIME_AFTER=$(stat -c %Y /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem 2>/dev/null || echo "0")
    if [ "$CERT_MTIME_BEFORE" -ne "$CERT_MTIME_AFTER" ]; then
      log_message "Certificate renewed successfully"
      chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
      chmod 644 /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem
      chmod 644 /etc/letsencrypt/live/condots.duckdns.org/privkey.pem
      touch /etc/letsencrypt/live/condots.duckdns.org/fullchain.pem.updated
      log_message "Signaled nginx to reload"
    fi
  else
    log_message "Certificate renewal failed"
  fi
  log_message "Next renewal check in 12 hours (at $(date -u -d @$(($(date +%s) + 43200)) '+%F %T'))"
  sleep 12h
done
