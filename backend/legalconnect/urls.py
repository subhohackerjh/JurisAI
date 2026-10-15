"""
URL configuration for legalconnect project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import Http404, JsonResponse
from django.db import connection

def hidden_admin(request):
    raise Http404

def health_check(request):
    """Liveness check for Render / load balancers; does not depend on the database."""
    return JsonResponse({'status': 'ok'})


def readiness_check(request):
    """Report whether required database access is available."""
    try:
        connection.ensure_connection()
    except Exception:
        return JsonResponse({'status': 'degraded', 'db': False}, status=503)
    return JsonResponse({'status': 'ok', 'db': True})

# Change the admin URL from the default /admin/ to a secret path
# Set ADMIN_URL env var in production to something like 'secret-panel-xyz123'
ADMIN_URL = getattr(settings, 'ADMIN_URL', 'admin')

urlpatterns = [
    path('', health_check, name='root_health_check'),
    path('health/', health_check, name='health_check'),
    path('ready/', readiness_check, name='readiness_check'),
    path(f'{ADMIN_URL}/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/cases/', include('cases.urls')),
    path('api/feedback/', include('feedback.urls')),
    path('api/ecourts/', include('ecourts.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/internships/', include('internships.urls')),
    path('api/analytics/', include('accounts.analytics_urls')),
]

# Always serve media files (uploaded documents, avatars etc.)
# In production, replace this with a proper CDN/S3 setup or configure nginx to serve /media/
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
