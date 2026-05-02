#!/bin/bash

# Legal24 Production Setup Script
# This script sets up the production environment for Legal24

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        print_error "Please run as a regular user with sudo privileges"
        exit 1
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
}

# Install required packages
install_packages() {
    print_status "Installing required packages..."
    
    packages=(
        python3
        python3-pip
        python3-venv
        postgresql
        postgresql-contrib
        redis-server
        nginx
        git
        curl
        wget
        ufw
        certbot
        python3-certbot-nginx
        nodejs
        npm
        build-essential
        libpq-dev
    )
    
    for package in "${packages[@]}"; do
        if ! dpkg -l | grep -q "^ii  $package "; then
            print_status "Installing $package..."
            sudo apt install -y $package
        else
            print_status "$package is already installed"
        fi
    done
}

# Setup PostgreSQL database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Start PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw legal24_prod; then
        print_warning "Database 'legal24_prod' already exists"
    else
        sudo -u postgres psql -c "CREATE DATABASE legal24_prod;"
        print_status "Created database 'legal24_prod'"
    fi
    
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='legal24_user'" | grep -q 1; then
        print_warning "User 'legal24_user' already exists"
    else
        sudo -u postgres psql -c "CREATE USER legal24_user WITH PASSWORD 'secure_password';"
        print_status "Created user 'legal24_user'"
    fi
    
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE legal24_prod TO legal24_user;"
    print_status "Granted privileges to 'legal24_user'"
}

# Setup Redis
setup_redis() {
    print_status "Setting up Redis..."
    
    # Start Redis service
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    # Test Redis connection
    if redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is running successfully"
    else
        print_error "Redis is not responding"
        exit 1
    fi
}

# Setup application directories
setup_directories() {
    print_status "Creating application directories..."
    
    directories=(
        /var/www/legal24
        /var/www/legal24/backend
        /var/www/legal24/media
        /var/www/legal24/static
        /var/log/legal24
        /var/backups/legal24
    )
    
    for dir in "${directories[@]}"; do
        if [[ ! -d "$dir" ]]; then
            sudo mkdir -p "$dir"
            print_status "Created directory: $dir"
        fi
    done
    
    # Set permissions
    sudo chown -R $USER:$USER /var/www/legal24
    sudo chmod -R 755 /var/www/legal24
    sudo chown -R www-data:www-data /var/log/legal24
    sudo chmod -R 755 /var/log/legal24
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python virtual environment..."
    
    cd /var/www/legal24/backend
    
    if [[ ! -d "venv" ]]; then
        python3 -m venv venv
        print_status "Created Python virtual environment"
    fi
    
    # Activate virtual environment and install dependencies
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Install additional production packages
    pip install gunicorn django-redis whitenoise psycopg2-binary
    
    print_status "Python dependencies installed"
}

# Setup Node.js environment
setup_node_env() {
    print_status "Setting up Node.js environment..."
    
    cd /var/www/legal24
    
    # Install dependencies
    npm install
    
    # Build for production
    npm run build
    
    print_status "Node.js environment setup completed"
}

# Setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Check if domain is provided
    read -p "Enter your domain (e.g., yourdomain.com): " domain
    
    if [[ -z "$domain" ]]; then
        print_warning "No domain provided. SSL setup skipped."
        return
    fi
    
    # Obtain SSL certificate
    if sudo certbot --nginx -d $domain -d www.$domain --non-interactive --agree-tos --email admin@$domain; then
        print_status "SSL certificate obtained for $domain"
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        print_status "Auto-renewal setup for SSL certificate"
    else
        print_error "Failed to obtain SSL certificate"
    fi
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP/HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow PostgreSQL (only if needed for remote connections)
    # sudo ufw allow 5432
    
    print_status "Firewall configured"
}

# Setup backup script
setup_backup() {
    print_status "Setting up backup script..."
    
    # Create backup script
    sudo tee /usr/local/bin/backup_legal24.sh > /dev/null << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/legal24"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="legal24_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U legal24_user $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /var/www/legal24/backend/media/

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    # Make backup script executable
    sudo chmod +x /usr/local/bin/backup_legal24.sh
    
    # Setup cron job for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup_legal24.sh") | crontab -
    
    print_status "Backup script configured"
}

# Setup log rotation
setup_logrotate() {
    print_status "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/legal24 > /dev/null << EOF
/var/log/legal24/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF
    
    print_status "Log rotation configured"
}

# Create systemd service files
setup_systemd_services() {
    print_status "Setting up systemd services..."
    
    # Create Gunicorn service
    sudo tee /etc/systemd/system/legal24-backend.service > /dev/null << EOF
[Unit]
Description=Legal24 Backend
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/legal24/backend
Environment=PATH=/var/www/legal24/backend/venv/bin
ExecStart=/var/www/legal24/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/legal24/legal24.sock legalconnect.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
    
    # Create frontend service
    sudo tee /etc/systemd/system/legal24-frontend.service > /dev/null << EOF
[Unit]
Description=Legal24 Frontend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/legal24
Environment=NODE_ENV=production
Environment=PATH=/usr/bin
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable services
    sudo systemctl daemon-reload
    sudo systemctl enable legal24-backend
    sudo systemctl enable legal24-frontend
    
    print_status "Systemd services configured"
}

# Main function
main() {
    print_status "Starting Legal24 production setup..."
    
    # Check prerequisites
    check_root
    
    # Run setup functions
    update_system
    install_packages
    setup_database
    setup_redis
    setup_directories
    setup_python_env
    setup_node_env
    setup_firewall
    setup_backup
    setup_logrotate
    setup_systemd_services
    
    # Ask about SSL setup
    read -p "Do you want to setup SSL certificate? (y/n): " setup_ssl_choice
    if [[ $setup_ssl_choice =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    print_status "Production setup completed!"
    print_warning "Please review the following:"
    print_warning "1. Update environment variables in backend/.env"
    print_warning "2. Update environment variables in .env.local"
    print_warning "3. Configure Nginx settings"
    print_warning "4. Run database migrations: python scripts/migrate.py --action migrate"
    print_warning "5. Create superuser: python manage.py createsuperuser"
    print_warning "6. Start services: sudo systemctl start legal24-backend legal24-frontend"
    print_warning "7. Configure domain DNS to point to this server"
}

# Run main function
main "$@"
