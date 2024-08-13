#!/bin/sh

TIMESTAMP_FILE="/etc/letsencrypt-renewal/last_renewal"

if [ ! -f "$TIMESTAMP_FILE" ]; then
  date +%s > "$TIMESTAMP_FILE"
fi

CHECK_INTERVAL=3600 # Check every hour
RENEWAL_INTERVAL=86400 # Try to renew every day

while true; do
  echo "Checking..."
  CURRENT_TIME=$(date +%s)
  LAST_RENEWAL=$(cat "$TIMESTAMP_FILE")
  TIME_DIFF=$((CURRENT_TIME - LAST_RENEWAL))
  if [ "$TIME_DIFF" -ge "$RENEWAL_INTERVAL" ]; then
    echo "Renewing certificate..."
    certbot renew
    date +%s > "$TIMESTAMP_FILE"
  fi
  sleep $CHECK_INTERVAL
done
