"""
Django management command to clear eCourts cache
"""
from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings


class Command(BaseCommand):
    help = 'Clear eCourts API cache'

    def add_arguments(self, parser):
        parser.add_argument(
            '--method',
            type=str,
            help='Clear cache for specific method (case_by_cnr, search_cases, cause_list, status)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Clear all cache (use with caution)',
        )
        parser.add_argument(
            '--stats',
            action='store_true',
            help='Show cache statistics',
        )

    def handle(self, *args, **options):
        if options['stats']:
            self.show_cache_stats()
            return

        if options['all']:
            self.clear_all_cache()
            return

        method = options.get('method')
        if method:
            self.clear_method_cache(method)
        else:
            self.stdout.write(
                self.style.WARNING('Please specify --method, --all, or --stats')
            )

    def clear_method_cache(self, method: str):
        """Clear cache for specific method"""
        # This is a simplified approach - in production, you might want to use cache versioning
        # or maintain a list of cache keys for each method
        
        # Clear using cache service pattern
        from ecourts.services import ecourts_service
        ecourts_service.clear_cache(method)
        
        self.stdout.write(
            self.style.SUCCESS(f'Cleared cache for method: {method}')
        )

    def clear_all_cache(self):
        """Clear all cache"""
        cache.clear()
        self.stdout.write(
            self.style.SUCCESS('Cleared all cache')
        )

    def show_cache_stats(self):
        """Show cache statistics"""
        try:
            # Get cache backend info
            cache_backend = settings.CACHES['default']['BACKEND']
            self.stdout.write(f'Cache Backend: {cache_backend}')
            
            # Try to get cache size (depends on backend)
            if hasattr(cache, '_cache'):
                cache_size = len(cache._cache)
                self.stdout.write(f'Cache Size: {cache_size} items')
            
            self.stdout.write(
                self.style.SUCCESS('Cache statistics displayed')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error getting cache stats: {e}')
            )
