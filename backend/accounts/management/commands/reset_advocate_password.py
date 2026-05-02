from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

class Command(BaseCommand):
    help = 'Reset password for advocate chiraghs@gmaill.com'

    def handle(self, *args, **options):
        try:
            # Find the advocate account
            advocate = User.objects.get(email='chiraghs@gmaill.com', role='advocate')
            
            # Reset password to 'admin123'
            advocate.password = make_password('admin123')
            advocate.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully reset password for {advocate.email}')
            )
            self.stdout.write(f'Name: {advocate.name}')
            self.stdout.write(f'Role: {advocate.role}')
            self.stdout.write(f'Approval Status: {advocate.approval_status}')
            self.stdout.write(f'Is Active: {advocate.is_active}')
            self.stdout.write(f'New password: admin123')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR('Advocate with email chiraghs@gmaill.com not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error resetting password: {str(e)}')
            )
