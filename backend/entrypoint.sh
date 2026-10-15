#!/bin/sh
# Backend entrypoint for Render / Docker
# Runs migrations, collects static files, then starts Daphne (ASGI + WebSocket)

set -e

echo "==> [JurisAI-backend] Running database migrations..."
python manage.py migrate --noinput

echo "==> [JurisAI-backend] Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> [JurisAI-backend] Starting Daphne ASGI server on port ${PORT:-8000}..."
exec daphne \
  -b 0.0.0.0 \
  -p "${PORT:-8000}" \
  --access-log - \
  --proxy-headers \
  legalconnect.asgi:application
