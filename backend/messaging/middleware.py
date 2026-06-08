"""
JWT authentication middleware for Django Channels WebSocket connections.
Reads the token from the Authorization header or ?token= query param.
"""
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


@database_sync_to_async
def get_user_from_token(token_key):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Try Authorization header first
        token = None
        headers = dict(scope.get('headers', []))
        auth_header = headers.get(b'authorization', b'').decode()
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]

        # Fallback: ?token= query param
        if not token:
            query_string = scope.get('query_string', b'').decode()
            for part in query_string.split('&'):
                if part.startswith('token='):
                    token = part.split('=', 1)[1]
                    break

        scope['user'] = await get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
