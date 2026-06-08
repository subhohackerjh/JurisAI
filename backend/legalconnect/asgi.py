"""
ASGI config for legalconnect project — supports both HTTP and WebSocket.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legalconnect.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from messaging.middleware import JWTAuthMiddlewareStack
from messaging.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
