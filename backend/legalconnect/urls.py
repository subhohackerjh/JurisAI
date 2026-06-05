"""
URL configuration for legalconnect project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import Http404

def hidden_admin(request):
    raise Http404

# Change the admin URL from the default /admin/ to a secret path
# Set ADMIN_URL env var in production to something like 'secret-panel-xyz123'
ADMIN_URL = getattr(settings, 'ADMIN_URL', 'admin')

urlpatterns = [
    path(f'{ADMIN_URL}/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/cases/', include('cases.urls')),
    path('api/feedback/', include('feedback.urls')),
    path('api/ecourts/', include('ecourts.urls')),
    path('api/messaging/', include('messaging.urls')),
]

# Always serve media files (uploaded documents, avatars etc.)
# In production, replace this with a proper CDN/S3 setup or configure nginx to serve /media/
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
