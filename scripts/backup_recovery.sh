#!/bin/bash

# JurisAI Backup and Recovery Script
# Comprehensive backup and recovery solution for JurisAI production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="/var/backups/legal24"
LOG_FILE="/var/log/legal24/backup.log"
RETENTION_DAYS=30
DB_NAME="legal24_prod"
DB_USER="legal24_user"
DB_HOST="localhost"
DB_PORT="5432"
MEDIA_DIR="/var/www/legal24/backend/media"
STATIC_DIR="/var/www/legal24/static"
CONFIG_DIR="/etc/legal24"

# S3 Configuration (optional)
S3_BUCKET=""
S3_REGION="us-east-1"

# Email for notifications
NOTIFICATION_EMAIL="admin@yourdomain.com"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> $LOG_FILE
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $1" >> $LOG_FILE
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >> $LOG_FILE
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> $LOG_FILE
}

# Function to send notification
send_notification() {
    local subject="$1"
    local message="$2"
    
    if command -v mail >/dev/null 2>&1 && [[ -n "$NOTIFICATION_EMAIL" ]]; then
        echo "$message" | mail -s "$subject" "$NOTIFICATION_EMAIL"
    fi
}

# Function to create backup directory
create_backup_dir() {
    local date_suffix=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/backup_$date_suffix"
    
    mkdir -p "$backup_path"
    echo "$backup_path"
}

# Function to backup database
backup_database() {
    local backup_path="$1"
    local sql_file="$backup_path/database.sql"
    
    print_status "Starting database backup..."
    
    # Create database backup
    if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$sql_file"; then
        # Compress the backup
        gzip "$sql_file"
        
        local file_size=$(du -h "${sql_file}.gz" | cut -f1)
        print_status "Database backup completed: ${sql_file}.gz ($file_size)"
        
        # Verify backup integrity
        if gzip -t "${sql_file}.gz" 2>/dev/null; then
            print_status "Database backup integrity verified"
            return 0
        else
            print_error "Database backup integrity check failed"
            return 1
        fi
    else
        print_error "Database backup failed"
        return 1
    fi
}

# Function to backup media files
backup_media() {
    local backup_path="$1"
    local media_backup="$backup_path/media.tar.gz"
    
    print_status "Starting media files backup..."
    
    if [[ -d "$MEDIA_DIR" ]]; then
        # Create compressed backup of media files
        if tar -czf "$media_backup" -C "$(dirname "$MEDIA_DIR")" "$(basename "$MEDIA_DIR")"; then
            local file_size=$(du -h "$media_backup" | cut -f1)
            print_status "Media files backup completed: $media_backup ($file_size)"
            return 0
        else
            print_error "Media files backup failed"
            return 1
        fi
    else
        print_warning "Media directory not found: $MEDIA_DIR"
        return 0
    fi
}

# Function to backup static files
backup_static() {
    local backup_path="$1"
    local static_backup="$backup_path/static.tar.gz"
    
    print_status "Starting static files backup..."
    
    if [[ -d "$STATIC_DIR" ]]; then
        # Create compressed backup of static files
        if tar -czf "$static_backup" -C "$(dirname "$STATIC_DIR")" "$(basename "$STATIC_DIR")"; then
            local file_size=$(du -h "$static_backup" | cut -f1)
            print_status "Static files backup completed: $static_backup ($file_size)"
            return 0
        else
            print_error "Static files backup failed"
            return 1
        fi
    else
        print_warning "Static directory not found: $STATIC_DIR"
        return 0
    fi
}

# Function to backup configuration files
backup_config() {
    local backup_path="$1"
    local config_backup="$backup_path/config.tar.gz"
    
    print_status "Starting configuration backup..."
    
    # Create config directory if it doesn't exist
    mkdir -p "$CONFIG_DIR"
    
    # Backup important configuration files
    local config_files=(
        "/var/www/legal24/backend/.env"
        "/var/www/legal24/.env.local"
        "/etc/nginx/sites-available/legal24"
        "/etc/systemd/system/legal24-backend.service"
        "/etc/systemd/system/legal24-frontend.service"
        "/etc/redis/redis.conf"
        "/etc/postgresql/*/main/postgresql.conf"
    )
    
    # Create temporary directory for config files
    local temp_config_dir="$backup_path/temp_config"
    mkdir -p "$temp_config_dir"
    
    local files_copied=0
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            local dest_file="$temp_config_dir$(echo "$config_file" | sed 's/\//_/g')"
            cp "$config_file" "$dest_file"
            ((files_copied++))
        fi
    done
    
    if [[ "$files_copied" -gt 0 ]]; then
        # Create compressed backup
        if tar -czf "$config_backup" -C "$temp_config_dir" .; then
            local file_size=$(du -h "$config_backup" | cut -f1)
            print_status "Configuration backup completed: $config_backup ($file_size, $files_copied files)"
            
            # Clean up temporary directory
            rm -rf "$temp_config_dir"
            return 0
        else
            print_error "Configuration backup failed"
            rm -rf "$temp_config_dir"
            return 1
        fi
    else
        print_warning "No configuration files found to backup"
        rm -rf "$temp_config_dir"
        return 0
    fi
}

# Function to upload to S3 (optional)
upload_to_s3() {
    local backup_path="$1"
    
    if [[ -z "$S3_BUCKET" ]]; then
        print_info "S3 backup not configured"
        return 0
    fi
    
    print_status "Uploading backup to S3..."
    
    if command -v aws >/dev/null 2>&1; then
        local backup_name=$(basename "$backup_path")
        
        if aws s3 sync "$backup_path" "s3://$S3_BUCKET/backups/$backup_name/" --region "$S3_REGION"; then
            print_status "S3 upload completed successfully"
            return 0
        else
            print_error "S3 upload failed"
            return 1
        fi
    else
        print_warning "AWS CLI not installed, skipping S3 upload"
        return 0
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Remove old backup directories
    for backup_dir in "$BACKUP_DIR"/backup_*; do
        if [[ -d "$backup_dir" ]]; then
            local dir_age=$(find "$backup_dir" -mtime +$RETENTION_DAYS -print)
            if [[ -n "$dir_age" ]]; then
                rm -rf "$backup_dir"
                ((deleted_count++))
                print_status "Removed old backup: $(basename "$backup_dir")"
            fi
        fi
    done
    
    if [[ "$deleted_count" -gt 0 ]]; then
        print_status "Cleanup completed: removed $deleted_count old backup(s)"
    else
        print_status "No old backups to remove"
    fi
}

# Function to create backup manifest
create_manifest() {
    local backup_path="$1"
    local manifest_file="$backup_path/MANIFEST.txt"
    
    {
        echo "JurisAI Backup Manifest"
        echo "======================"
        echo "Created: $(date)"
        echo "Hostname: $(hostname)"
        echo "Backup Path: $backup_path"
        echo ""
        echo "Backup Contents:"
        echo "---------------"
        find "$backup_path" -type f -exec ls -lh {} \; | awk '{print $5, $9}'
        echo ""
        echo "System Information:"
        echo "-------------------"
        echo "OS: $(uname -s) $(uname -r)"
        echo "Django Version: $(cd /var/www/legal24/backend && python -c 'import django; print(django.get_version())' 2>/dev/null || echo 'Unknown')"
        echo "PostgreSQL Version: $(psql --version 2>/dev/null | head -1 || echo 'Unknown')"
        echo "Redis Version: $(redis-server --version 2>/dev/null | head -1 || echo 'Unknown')"
        echo "Node Version: $(node --version 2>/dev/null || echo 'Unknown')"
        echo "NPM Version: $(npm --version 2>/dev/null || echo 'Unknown')"
    } > "$manifest_file"
    
    print_status "Backup manifest created: $manifest_file"
}

# Function to perform full backup
perform_backup() {
    print_info "Starting full backup process..."
    
    # Create backup directory
    local backup_path=$(create_backup_dir)
    print_status "Backup directory: $backup_path"
    
    local errors=0
    
    # Perform individual backups
    backup_database "$backup_path" || ((errors++))
    backup_media "$backup_path" || ((errors++))
    backup_static "$backup_path" || ((errors++))
    backup_config "$backup_path" || ((errors++))
    
    # Create manifest
    create_manifest "$backup_path"
    
    # Upload to S3 if configured
    upload_to_s3 "$backup_path" || ((errors++))
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send notification
    if [[ "$errors" -eq 0 ]]; then
        local backup_size=$(du -sh "$backup_path" | cut -f1)
        send_notification "JurisAI Backup Successful" "Backup completed successfully at $backup_path (Size: $backup_size)"
        print_status "Full backup completed successfully (Size: $backup_size)"
    else
        send_notification "JurisAI Backup Failed" "Backup completed with $errors errors at $backup_path"
        print_error "Backup completed with $errors errors"
    fi
    
    return $errors
}

# Function to restore database
restore_database() {
    local backup_file="$1"
    
    print_status "Starting database restore from: $backup_file"
    
    # Verify backup file exists
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Create restore confirmation
    echo "WARNING: This will completely replace the current database!"
    echo "Database: $DB_NAME"
    echo "Backup file: $backup_file"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        print_info "Database restore cancelled"
        return 0
    fi
    
    # Drop and recreate database
    print_status "Dropping existing database..."
    PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    print_status "Creating new database..."
    PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    
    # Restore database
    print_status "Restoring database from backup..."
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    else
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" < "$backup_file"
    fi
    
    print_status "Database restore completed"
    return 0
}

# Function to restore files
restore_files() {
    local backup_file="$1"
    local target_dir="$2"
    
    print_status "Restoring files from: $backup_file to: $target_dir"
    
    # Verify backup file exists
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Create target directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Extract files
    if tar -xzf "$backup_file" -C "$target_dir"; then
        print_status "Files restored successfully"
        return 0
    else
        print_error "File restore failed"
        return 1
    fi
}

# Function to list available backups
list_backups() {
    print_info "Available backups:"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        print_warning "Backup directory not found: $BACKUP_DIR"
        return 1
    fi
    
    local backup_count=0
    
    for backup_dir in "$BACKUP_DIR"/backup_*; do
        if [[ -d "$backup_dir" ]]; then
            local backup_name=$(basename "$backup_dir")
            local backup_date=$(echo "$backup_name" | sed 's/backup_//' | sed 's/_/ /')
            local backup_size=$(du -sh "$backup_dir" | cut -f1)
            
            echo "  $backup_name - $backup_date - $backup_size"
            ((backup_count++))
        fi
    done
    
    if [[ "$backup_count" -eq 0 ]]; then
        print_warning "No backups found"
    else
        print_status "Found $backup_count backup(s)"
    fi
}

# Function to show backup details
show_backup_details() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [[ ! -d "$backup_path" ]]; then
        print_error "Backup not found: $backup_name"
        return 1
    fi
    
    print_info "Backup details for: $backup_name"
    echo "Path: $backup_path"
    echo "Size: $(du -sh "$backup_path" | cut -f1)"
    echo "Created: $(stat -c %y "$backup_path")"
    echo ""
    
    if [[ -f "$backup_path/MANIFEST.txt" ]]; then
        echo "Manifest:"
        cat "$backup_path/MANIFEST.txt"
    else
        echo "Contents:"
        find "$backup_path" -type f -exec ls -lh {} \; | awk '{print $5, $9}'
    fi
}

# Main function
main() {
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    case "${1:-backup}" in
        "backup")
            perform_backup
            ;;
        "restore-db")
            if [[ -z "$2" ]]; then
                print_error "Usage: $0 restore-db <backup_file>"
                exit 1
            fi
            restore_database "$2"
            ;;
        "restore-media")
            if [[ -z "$2" ]]; then
                print_error "Usage: $0 restore-media <backup_file> [target_dir]"
                exit 1
            fi
            restore_files "$2" "${3:-$MEDIA_DIR}"
            ;;
        "restore-static")
            if [[ -z "$2" ]]; then
                print_error "Usage: $0 restore-static <backup_file> [target_dir]"
                exit 1
            fi
            restore_files "$2" "${3:-$STATIC_DIR}"
            ;;
        "list")
            list_backups
            ;;
        "details")
            if [[ -z "$2" ]]; then
                print_error "Usage: $0 details <backup_name>"
                exit 1
            fi
            show_backup_details "$2"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "help"|"-h"|"--help")
            echo "JurisAI Backup and Recovery Script"
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  backup           - Perform full backup (default)"
            echo "  restore-db       - Restore database from backup"
            echo "  restore-media    - Restore media files from backup"
            echo "  restore-static   - Restore static files from backup"
            echo "  list             - List available backups"
            echo "  details          - Show backup details"
            echo "  cleanup          - Clean up old backups"
            echo "  help             - Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 backup"
            echo "  $0 restore-db /var/backups/legal24/backup_20240430_120000/database.sql.gz"
            echo "  $0 restore-media /var/backups/legal24/backup_20240430_120000/media.tar.gz"
            echo "  $0 list"
            echo "  $0 details backup_20240430_120000"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Set DB_PASSWORD from environment if not set
if [[ -z "$DB_PASSWORD" ]]; then
    # Try to get password from environment or prompt
    if [[ -f "/var/www/legal24/backend/.env" ]]; then
        DB_PASSWORD=$(grep "DB_PASSWORD=" /var/www/legal24/backend/.env | cut -d= -f2)
    fi
    
    if [[ -z "$DB_PASSWORD" ]]; then
        echo "Database password not found in environment or .env file"
        read -s -p "Enter database password: " DB_PASSWORD
        echo
    fi
fi

# Export password for PostgreSQL commands
export PGPASSWORD="$DB_PASSWORD"

# Run main function
main "$@"
