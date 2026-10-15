# JurisAI Production Deployment Guide

**Updated:** April 30, 2026  
**Version:** 1.0.0  
**Status:** Production Ready

---

## Overview

JurisAI is a full-stack legal services platform with Django backend and Next.js frontend. This guide covers complete production deployment including security, monitoring, and maintenance procedures.

## Architecture

```
Frontend: Next.js 16.2.0 (React 19)
Backend: Django 5.0 + Django REST Framework
Database: PostgreSQL
Cache: Redis
Static Files: AWS S3 / CloudFront
Deployment: Docker + Nginx
Monitoring: Custom dashboard + logs
```

---

## Prerequisites

### Infrastructure Requirements

- **Server:** Ubuntu 22.04 LTS (2+ cores, 4GB+ RAM)
- **Database:** PostgreSQL 14+ 
- **Cache:** Redis 6+
- **SSL:** Valid SSL certificate
- **Domain:** Configured DNS
- **Storage:** 50GB+ SSD

### Software Requirements

- Docker & Docker Compose
- Nginx
- Git
- Python 3.11+
- Node.js 18+
- PM2 (process manager)

---

## Environment Configuration

### Backend Environment Variables

Create `.env` in backend directory:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=JurisAI_prod
DB_USER=JurisAI_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# eCourts API
ECOURTS_API_KEY=your-ecourts-api-key
ECOURTS_BASE_URL=https://api.ecourts.gov.in

# Media Files
MEDIA_ROOT=/var/www/JurisAI/media
STATIC_ROOT=/var/www/JurisAI/static

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Environment Variables

Create `.env.local` in root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## Database Setup

### PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE JurisAI_prod;
CREATE USER JurisAI_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE JurisAI_prod TO JurisAI_user;
\q
```

### Database Configuration

```bash
# Configure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: local   JurisAI_prod   JurisAI_user   md5

sudo systemctl restart postgresql
```

---

## Redis Setup

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: bind 127.0.0.1
# Set: requirepass your-redis-password

sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## Application Deployment

### 1. Clone Repository

```bash
cd /var/www
sudo git clone https://github.com/your-username/JurisAI.git
sudo chown -R $USER:$USER JurisAI
cd JurisAI
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install additional production packages
pip install django-redis gunicorn whitenoise

# Environment setup
cp .env.example .env
# Edit .env with production values

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Load initial data (optional)
python manage.py loaddata fixtures/initial_data.json
```

### 3. Frontend Build

```bash
cd ../

# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm run start
```

---

## Docker Deployment (Recommended)

### Docker Compose Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: JurisAI_prod
      POSTGRES_USER: JurisAI_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass your-redis-password
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      - DEBUG=False
      - DB_HOST=db
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - static_volume:/app/static
      - media_volume:/app/media

  frontend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/var/www/static
      - media_volume:/var/www/media
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "legalconnect.wsgi:application"]
```

### Frontend Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

### Deploy with Docker

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

---

## Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login endpoints (stricter rate limiting)
        location /api/auth/login/ {
            limit_req zone=login burst=10 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /var/www/media/;
            expires 1y;
            add_header Cache-Control "public";
        }
    }
}
```

---

## SSL Certificate Setup

### Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Process Management

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'JurisAI-backend',
      script: 'gunicorn',
      args: '--bind 0.0.0.0:8000 legalconnect.wsgi:application',
      cwd: '/var/www/JurisAI/backend',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        DEBUG: 'False',
      }
    },
    {
      name: 'JurisAI-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/JurisAI',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      }
    }
  ]
};
```

### Start with PM2

```bash
# Install PM2
npm install -g pm2

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

---

## Monitoring and Logging

### Application Logging

Configure logging in `backend/settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/JurisAI/django.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/JurisAI/django-error.log',
            'maxBytes': 1024*1024*15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'JurisAI': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Create Log Directories

```bash
sudo mkdir -p /var/log/JurisAI
sudo chown www-data:www-data /var/log/JurisAI
```

### Nginx Logging

```nginx
# Add to nginx.conf in http block
log_format detailed '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   '$request_time $upstream_response_time';

access_log /var/log/nginx/JurisAI_access.log detailed;
error_log /var/log/nginx/JurisAI_error.log;
```

---

## Backup Strategy

### Database Backup Script

Create `/usr/local/bin/backup_JurisAI.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/JurisAI"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="JurisAI_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U JurisAI_user $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /var/www/JurisAI/backend/media/

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Setup Cron Job

```bash
sudo chmod +x /usr/local/bin/backup_JurisAI.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup_JurisAI.sh
```

---

## Security Hardening

### Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### Django Security Settings

Ensure these are in `backend/settings.py`:

```python
# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = 'DENY'

# Session Security
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 3600
SESSION_COOKIE_SAMESITE = 'Strict'

# CSRF Protection
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_AGE = 3600
CSRF_COOKIE_SAMESITE = 'Strict'
```

---

## Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_cases_customer_id ON cases_case(customer_id);
CREATE INDEX CONCURRENTLY idx_cases_advocate_id ON cases_case(advocate_id);
CREATE INDEX CONCURRENTLY idx_cases_status ON cases_case(status);
CREATE INDEX CONCURRENTLY idx_cases_created_at ON cases_case(created_at);
CREATE INDEX CONCURRENTLY idx_feedback_user_id ON feedback_feedback(user_id);
CREATE INDEX CONCURRENTLY idx_feedback_status ON feedback_feedback(status);
```

### Redis Configuration

```bash
# Optimize Redis for production
sudo nano /etc/redis/redis.conf

# Set these values:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database created and migrated
- [ ] Redis server running
- [ ] Static files collected
- [ ] Media directory permissions set
- [ ] Backup script configured
- [ ] Monitoring setup
- [ ] Security headers configured
- [ ] Rate limiting configured

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Test user registration/login
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Verify SSL certificate
- [ ] Check application logs
- [ ] Monitor resource usage
- [ ] Test backup restoration
- [ ] Verify cache functionality
- [ ] Test eCourts API integration

---

## Maintenance Procedures

### Regular Tasks

**Daily:**
- Check application logs for errors
- Monitor resource usage
- Verify backup completion

**Weekly:**
- Review security logs
- Update system packages
- Check SSL certificate expiry

**Monthly:**
- Database maintenance (VACUUM, ANALYZE)
- Review performance metrics
- Update application dependencies

**Quarterly:**
- Security audit
- Performance optimization review
- Backup restoration test

### Emergency Procedures

**Application Down:**
1. Check logs: `tail -f /var/log/JurisAI/django-error.log`
2. Restart services: `pm2 restart all`
3. Check database connectivity
4. Verify Redis connection

**Database Issues:**
1. Check PostgreSQL status: `sudo systemctl status postgresql`
2. Review logs: `sudo tail -f /var/log/postgresql/postgresql-14-main.log`
3. Restart if needed: `sudo systemctl restart postgresql`

**High Resource Usage:**
1. Monitor: `htop` and `docker stats`
2. Check logs for memory leaks
3. Restart services if needed

---

## Troubleshooting

### Common Issues

1. **502 Bad Gateway:** Check if backend is running
2. **Database Connection:** Verify PostgreSQL status and credentials
3. **Static Files 404:** Run `collectstatic` and check Nginx config
4. **Slow Performance:** Check database indexes and Redis cache
5. **Email Issues:** Verify SMTP settings and firewall

### Debug Commands

```bash
# Check application status
pm2 status
pm2 logs

# Check database connection
python manage.py dbshell

# Check Redis connection
redis-cli ping

# Check Nginx status
sudo nginx -t
sudo systemctl status nginx
```

---

## Support Contact

For production issues:
1. Check logs and monitoring
2. Review this troubleshooting guide
3. Contact development team with:
   - Error logs
   - System metrics
   - Steps to reproduce

---

**Last Updated:** April 30, 2026  
**Next Review:** July 30, 2026
