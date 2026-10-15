# ─────────────────────────────────────────────────────────────────────────────
# JurisAI — Django Backend (Daphne ASGI + WebSocket)
# Target: Render Web Service
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: dependency builder ───────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# System build deps (psycopg2-binary, Pillow, argon2-cffi)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    libwebp-dev \
    zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*

# Install Python wheels into a prefix so we can copy them to the final stage
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

# Runtime libs only (no gcc)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libjpeg62-turbo \
    libwebp7 \
  && rm -rf /var/lib/apt/lists/*

# Non-root user for security
RUN useradd --no-create-home --shell /bin/bash appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Fix line endings and make entrypoint executable
RUN sed -i 's/\r$//' entrypoint.sh \
 && chmod +x entrypoint.sh

# Create directories for static/media with correct ownership
RUN mkdir -p /app/staticfiles /app/media \
 && chown -R appuser:appuser /app

USER appuser

# Render injects PORT; default to 8000 for local use
ENV PORT=8000
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SETTINGS_MODULE=legalconnect.production_settings

EXPOSE 8000

# Health-check — Render will poll this
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD-SHELL python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ.get('PORT', '8000') + '/health/')"

ENTRYPOINT ["./entrypoint.sh"]
