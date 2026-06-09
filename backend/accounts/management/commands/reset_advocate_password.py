"""
This command was removed — it contained a hardcoded password (admin123) and
a real user email. Use Django's built-in password reset instead:

    python manage.py changepassword <email>

Or via the admin panel: /admin/accounts/user/
"""
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Deprecated — use: python manage.py changepassword <email>'

    def handle(self, *args, **options):
        self.stdout.write(self.style.ERROR(
            'This command has been removed for security reasons.\n'
            'Use: python manage.py changepassword <email>\n'
            'Or reset via the Django admin panel.'
        ))
