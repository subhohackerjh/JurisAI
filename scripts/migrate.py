#!/usr/bin/env python3
"""
Production Database Migration Script for JurisAI

This script handles database migrations for production deployment
with proper error handling, logging, and rollback capabilities.

Usage:
    python scripts/migrate.py --action [migrate|rollback|status] [--dry-run]
"""

import os
import sys
import django
import argparse
import logging
from datetime import datetime
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legalconnect.settings')
django.setup()

from django.core.management import execute_from_command_line, call_command
from django.db import connection
from django.core.management.base import BaseCommand
from django.core.management.commands.migrate import Command as MigrateCommand
from django.core.management.commands.showmigrations import Command as ShowMigrationsCommand

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/legal24/migration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class MigrationManager:
    """Handles database migrations with safety checks and logging"""
    
    def __init__(self, dry_run=False):
        self.dry_run = dry_run
        self.backup_enabled = True
        
    def check_database_connection(self):
        """Verify database connection"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            logger.info("Database connection: OK")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    def create_backup(self):
        """Create database backup before migration"""
        if not self.backup_enabled or self.dry_run:
            logger.info("Backup skipped (dry run or disabled)")
            return True
            
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = f'/var/backups/legal24/pre_migration_{timestamp}.sql'
            
            # Create backup directory if it doesn't exist
            os.makedirs('/var/backups/legal24', exist_ok=True)
            
            # Get database connection details
            db_name = connection.settings_dict.get('NAME')
            db_user = connection.settings_dict.get('USER')
            db_host = connection.settings_dict.get('HOST', 'localhost')
            db_port = connection.settings_dict.get('PORT', '5432')
            
            # Create backup using pg_dump
            import subprocess
            cmd = [
                'pg_dump',
                '-h', db_host,
                '-p', str(db_port),
                '-U', db_user,
                '-d', db_name,
                '-f', backup_file
            ]
            
            if self.dry_run:
                logger.info(f"DRY RUN: Would execute: {' '.join(cmd)}")
                return True
                
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info(f"Database backup created: {backup_file}")
                return True
            else:
                logger.error(f"Backup failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Backup creation failed: {e}")
            return False
    
    def get_pending_migrations(self):
        """Get list of pending migrations"""
        try:
            from django.core.management.commands.showmigrations import Command
            from io import StringIO
            from django.core.management import call_command
            
            # Capture showmigrations output
            output = StringIO()
            call_command('showmigrations', '--plan', stdout=output)
            
            pending = []
            lines = output.getvalue().split('\n')
            
            for line in lines:
                if '[ ]' in line:  # Pending migration marker
                    migration = line.strip()
                    pending.append(migration)
            
            return pending
            
        except Exception as e:
            logger.error(f"Failed to get pending migrations: {e}")
            return []
    
    def run_migrations(self, app_label=None, migration_name=None):
        """Run database migrations"""
        try:
            if self.dry_run:
                logger.info("DRY RUN: Migration simulation")
                pending = self.get_pending_migrations()
                if pending:
                    logger.info(f"Pending migrations to apply: {pending}")
                else:
                    logger.info("No pending migrations")
                return True
            
            # Build migration command
            args = ['migrate']
            if app_label:
                args.append(app_label)
                if migration_name:
                    args.append(migration_name)
            
            # Run migrations
            logger.info("Starting database migration...")
            execute_from_command_line(['manage.py'] + args)
            
            logger.info("Migration completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            return False
    
    def rollback_migration(self, app_label, migration_name):
        """Rollback to a specific migration"""
        try:
            if self.dry_run:
                logger.info(f"DRY RUN: Would rollback {app_label} to {migration_name}")
                return True
            
            logger.info(f"Rolling back {app_label} to {migration_name}...")
            call_command('migrate', app_label, migration_name)
            logger.info("Rollback completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return False
    
    def check_migration_status(self):
        """Check current migration status"""
        try:
            from django.core.management.commands.showmigrations import Command
            from io import StringIO
            from django.core.management import call_command
            
            output = StringIO()
            call_command('showmigrations', stdout=output)
            
            logger.info("Migration Status:")
            logger.info(output.getvalue())
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to check migration status: {e}")
            return False


def main():
    """Main function to handle command line arguments"""
    parser = argparse.ArgumentParser(description='JurisAI Migration Manager')
    parser.add_argument(
        '--action',
        choices=['migrate', 'rollback', 'status'],
        required=True,
        help='Action to perform'
    )
    parser.add_argument(
        '--app',
        help='App label (for specific app migration)'
    )
    parser.add_argument(
        '--migration',
        help='Migration name (for specific migration)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Simulate actions without executing'
    )
    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='Skip database backup'
    )
    
    args = parser.parse_args()
    
    # Initialize migration manager
    manager = MigrationManager(dry_run=args.dry_run)
    
    if args.no_backup:
        manager.backup_enabled = False
    
    # Check database connection
    if not manager.check_database_connection():
        logger.error("Cannot proceed without database connection")
        sys.exit(1)
    
    # Execute requested action
    success = False
    
    if args.action == 'migrate':
        # Create backup before migration
        if not manager.create_backup():
            logger.error("Backup failed, aborting migration")
            sys.exit(1)
        
        success = manager.run_migrations(args.app, args.migration)
        
    elif args.action == 'rollback':
        if not args.app or not args.migration:
            logger.error("Rollback requires --app and --migration arguments")
            sys.exit(1)
        
        success = manager.rollback_migration(args.app, args.migration)
        
    elif args.action == 'status':
        success = manager.check_migration_status()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
