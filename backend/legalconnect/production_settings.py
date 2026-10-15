"""
Production settings for JurisAI.
Loaded when DJANGO_SETTINGS_MODULE=legalconnect.production_settings
All sensitive values come from environment variables — never hardcoded.
"""

import os
import dj_database_url
from .settings import *   # noqa: F401, F403 — extend base settings

# ── Core ─────────────────────────────────────────────────────────────────────
DEBUG = False
SECRET_KEY = os.environ['SECRET_KEY']   # fail loudly if missing

ALLOWED_HOSTS = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', '').split(',') if h.strip()]
# Allow the container's local Docker health check.
ALLOWED_HOSTS.extend(['localhost', '127.0.0.1'])

# Render injects this automatically
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME', '')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# ── ASGI / Channels ──────────────────────────────────────────────────────────
ASGI_APPLICATION = 'legalconnect.asgi.application'

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379')

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [REDIS_URL],
            'capacity': 1500,
            'expiry': 60,
        },
    }
}

# ── Database ─────────────────────────────────────────────────────────────────
# Uses Supabase connection pooler (IPv4) — direct connection is IPv6 only on free Render
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', ''),
        conn_max_age=0,          # 0 = don't persist connections through pgbouncer
        conn_health_checks=False,
        ssl_require=True,
    )
}
# Required for Supabase pgbouncer in transaction mode
DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True

# ── Caching ───────────────────────────────────────────────────────────────────
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'SOCKET_CONNECT_TIMEOUT': 5,
            'SOCKET_TIMEOUT': 5,
            'RETRY_ON_TIMEOUT': True,
            'MAX_CONNECTIONS': 50,
            'IGNORE_EXCEPTIONS': True,
        },
        'KEY_PREFIX': 'legal24',
        'TIMEOUT': 3600,
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# ── Security ──────────────────────────────────────────────────────────────────
# Render terminates TLS at the edge — don't double-redirect
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_COOKIE_AGE = 3600

CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'

_frontend_url = os.environ.get('FRONTEND_URL', '')
_backend_url  = os.environ.get('BACKEND_URL', '')
CSRF_TRUSTED_ORIGINS = [u for u in [_frontend_url, _backend_url] if u]

# ── CORS ──────────────────────────────────────────────────────────────────────
_extra_cors = [o.strip() for o in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if o.strip()]
CORS_ALLOWED_ORIGINS = list({_frontend_url, *_extra_cors} - {''})
CORS_ALLOW_CREDENTIALS = True

# ── Static & media ────────────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = '/app/staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/media'

# ── Password hashing ──────────────────────────────────────────────────────────
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# ── Logging → stdout (Render log drain picks this up) ─────────────────────────
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'render': {
            'format': '[{levelname}] {asctime} {name} — {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'render',
        },
    },
    'root': {'handlers': ['console'], 'level': os.environ.get('LOG_LEVEL', 'INFO')},
    'loggers': {
        'django':          {'handlers': ['console'], 'level': 'INFO',    'propagate': False},
        'django.security': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
    },
}

# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@legal24.in')

# ── URLs used by backend (e.g. Cashfree return URL) ──────────────────────────
FRONTEND_URL = _frontend_url or 'https://legal24.onrender.com'
BACKEND_URL  = _backend_url  or 'https://legal24-api.onrender.com'

# ── Third-party API keys ──────────────────────────────────────────────────────
ECOURTS_API_KEY  = os.environ.get('ECOURTS_API_KEY', '')
ECOURTS_BASE_URL = os.environ.get('ECOURTS_BASE_URL', 'https://api.ecourts.gov.in')

CASHFREE_APP_ID     = os.environ.get('CASHFREE_APP_ID', '')
CASHFREE_SECRET_KEY = os.environ.get('CASHFREE_SECRET_KEY', '')
CASHFREE_ENV        = os.environ.get('CASHFREE_ENV', 'production')

# AI is handled by Next.js API route — no key needed in Django

# ── Sentry (optional) ────────────────────────────────────────────────────────
if os.environ.get('SENTRY_DSN'):
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    sentry_sdk.init(
        dsn=os.environ['SENTRY_DSN'],
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.05,
        send_default_pii=False,
        environment='production',
    )

# ── API throttling (tighter in production) ───────────────────────────────────
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {      # noqa: F405
    'anon':     '100/hour',
    'user':     '1000/hour',
    'login':    '10/hour',
    'register': '5/hour',
}
