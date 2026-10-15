#!/bin/bash

# JurisAI Production Monitoring Script
# This script monitors the health and performance of the JurisAI application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LOG_FILE="/var/log/legal24/monitoring.log"
ALERT_EMAIL="admin@yourdomain.com"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

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

# Function to send alerts
send_alert() {
    local message="$1"
    local severity="$2"
    
    # Send email alert
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "JurisAI Alert [$severity]" $ALERT_EMAIL
    fi
    
    # Send Slack webhook
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$WEBHOOK_URL" >/dev/null 2>&1
    fi
}

# Function to check service status
check_service() {
    local service="$1"
    local description="$2"
    
    if systemctl is-active --quiet "$service"; then
        print_status "$description is running"
        return 0
    else
        print_error "$description is not running"
        send_alert "$description is not running on $(hostname)" "CRITICAL"
        return 1
    fi
}

# Function to check web server response
check_web_server() {
    local url="$1"
    local service="$2"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
    
    if [[ "$response" == "200" ]]; then
        print_status "$service is responding (HTTP $response)"
        return 0
    else
        print_error "$service is not responding (HTTP $response)"
        send_alert "$service is not responding (HTTP $response) on $(hostname)" "CRITICAL"
        return 1
    fi
}

# Function to check database connection
check_database() {
    local result=$(psql -h localhost -U legal24_user -d legal24_prod -tAc "SELECT 1" 2>/dev/null)
    
    if [[ "$result" == "1" ]]; then
        print_status "Database connection: OK"
        return 0
    else
        print_error "Database connection failed"
        send_alert "Database connection failed on $(hostname)" "CRITICAL"
        return 1
    fi
}

# Function to check Redis connection
check_redis() {
    if redis-cli ping >/dev/null 2>&1; then
        print_status "Redis connection: OK"
        return 0
    else
        print_error "Redis connection failed"
        send_alert "Redis connection failed on $(hostname)" "CRITICAL"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ "$usage" -lt 80 ]]; then
        print_status "Disk usage: ${usage}%"
        return 0
    elif [[ "$usage" -lt 90 ]]; then
        print_warning "Disk usage: ${usage}% (warning)"
        return 1
    else
        print_error "Disk usage: ${usage}% (critical)"
        send_alert "Disk usage is ${usage}% on $(hostname)" "CRITICAL"
        return 2
    fi
}

# Function to check memory usage
check_memory() {
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [[ "$usage" -lt 80 ]]; then
        print_status "Memory usage: ${usage}%"
        return 0
    elif [[ "$usage" -lt 90 ]]; then
        print_warning "Memory usage: ${usage}% (warning)"
        return 1
    else
        print_error "Memory usage: ${usage}% (critical)"
        send_alert "Memory usage is ${usage}% on $(hostname)" "CRITICAL"
        return 2
    fi
}

# Function to check CPU load
check_cpu_load() {
    local load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cores=$(nproc)
    local threshold=$((cores * 2))
    
    # Convert load to integer for comparison
    load_int=$(echo "$load * 100" | bc | cut -d. -f1)
    threshold_int=$((threshold * 100))
    
    if [[ "$load_int" -lt "$threshold_int" ]]; then
        print_status "CPU load: $load (cores: $cores)"
        return 0
    else
        print_warning "CPU load: $load (high)"
        return 1
    fi
}

# Function to check application logs for errors
check_application_logs() {
    local error_count=$(grep -c "ERROR" /var/log/legal24/django-error.log 2>/dev/null || echo "0")
    local recent_errors=$(tail -100 /var/log/legal24/django-error.log 2>/dev/null | grep -c "ERROR" || echo "0")
    
    if [[ "$recent_errors" -gt 5 ]]; then
        print_error "High error rate: $recent_errors errors in last 100 lines"
        send_alert "High error rate detected in application logs on $(hostname)" "WARNING"
        return 1
    else
        print_status "Application error rate: $recent_errors errors in last 100 lines"
        return 0
    fi
}

# Function to check SSL certificate
check_ssl_certificate() {
    local domain="$1"
    local expiry_date=$(echo | openssl s_client -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [[ "$days_until_expiry" -gt 30 ]]; then
        print_status "SSL certificate: $days_until_expiry days until expiry"
        return 0
    elif [[ "$days_until_expiry" -gt 7 ]]; then
        print_warning "SSL certificate: $days_until_expiry days until expiry (warning)"
        return 1
    else
        print_error "SSL certificate: $days_until_expiry days until expiry (critical)"
        send_alert "SSL certificate expires in $days_until_expiry days on $(hostname)" "CRITICAL"
        return 2
    fi
}

# Function to check eCourts API
check_ecourts_api() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.ecourts.gov.in/api/status" --max-time 10)
    
    if [[ "$response" == "200" ]]; then
        print_status "eCourts API: OK"
        return 0
    else
        print_warning "eCourts API: Not responding (HTTP $response)"
        return 1
    fi
}

# Function to generate health report
generate_health_report() {
    local report_file="/var/log/legal24/health_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "JurisAI Health Report"
        echo "======================="
        echo "Generated: $(date)"
        echo "Hostname: $(hostname)"
        echo ""
        echo "System Information:"
        echo "-------------------"
        echo "OS: $(uname -s) $(uname -r)"
        echo "Uptime: $(uptime -p)"
        echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
        echo ""
        echo "Disk Usage:"
        df -h | grep -E "Filesystem|/dev/"
        echo ""
        echo "Memory Usage:"
        free -h
        echo ""
        echo "Service Status:"
        echo "---------------"
        systemctl is-active legal24-backend 2>/dev/null || echo "legal24-backend: inactive"
        systemctl is-active legal24-frontend 2>/dev/null || echo "legal24-frontend: inactive"
        systemctl is-active nginx 2>/dev/null || echo "nginx: inactive"
        systemctl is-active postgresql 2>/dev/null || echo "postgresql: inactive"
        systemctl is-active redis-server 2>/dev/null || echo "redis-server: inactive"
        echo ""
        echo "Recent Errors (last 10):"
        echo "----------------------"
        tail -10 /var/log/legal24/django-error.log 2>/dev/null || echo "No error log found"
    } > "$report_file"
    
    print_info "Health report generated: $report_file"
}

# Main monitoring function
run_monitoring() {
    print_info "Starting JurisAI monitoring check..."
    
    local issues=0
    
    # Check system services
    check_service "legal24-backend" "Backend Service" || ((issues++))
    check_service "legal24-frontend" "Frontend Service" || ((issues++))
    check_service "nginx" "Nginx Web Server" || ((issues++))
    check_service "postgresql" "PostgreSQL Database" || ((issues++))
    check_service "redis-server" "Redis Cache" || ((issues++))
    
    # Check web endpoints
    check_web_server "http://localhost:8000/api/auth/status/" "Backend API" || ((issues++))
    check_web_server "http://localhost:3000" "Frontend Application" || ((issues++))
    
    # Check database and cache
    check_database || ((issues++))
    check_redis || ((issues++))
    
    # Check system resources
    check_disk_space || ((issues++))
    check_memory || ((issues++))
    check_cpu_load || ((issues++))
    
    # Check application health
    check_application_logs || ((issues++))
    
    # Check SSL certificate (if domain is set)
    if [[ -n "$DOMAIN" ]]; then
        check_ssl_certificate "$DOMAIN" || ((issues++))
    fi
    
    # Check external services
    check_ecourts_api || ((issues++))
    
    # Generate summary
    if [[ "$issues" -eq 0 ]]; then
        print_status "All systems operational"
    else
        print_warning "Found $issues issue(s) requiring attention"
    fi
    
    # Generate health report
    generate_health_report
    
    print_info "Monitoring check completed"
    return $issues
}

# Parse command line arguments
case "${1:-check}" in
    "check")
        run_monitoring
        ;;
    "report")
        generate_health_report
        ;;
    "services")
        print_info "Checking service status only..."
        check_service "legal24-backend" "Backend Service"
        check_service "legal24-frontend" "Frontend Service"
        check_service "nginx" "Nginx Web Server"
        check_service "postgresql" "PostgreSQL Database"
        check_service "redis-server" "Redis Cache"
        ;;
    "resources")
        print_info "Checking system resources only..."
        check_disk_space
        check_memory
        check_cpu_load
        ;;
    "logs")
        print_info "Checking application logs only..."
        check_application_logs
        tail -20 /var/log/legal24/django-error.log
        ;;
    "help"|"-h"|"--help")
        echo "JurisAI Monitoring Script"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check     - Run complete monitoring check (default)"
        echo "  report    - Generate health report"
        echo "  services  - Check service status only"
        echo "  resources - Check system resources only"
        echo "  logs      - Check application logs only"
        echo "  help      - Show this help message"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
