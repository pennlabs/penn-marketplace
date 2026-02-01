"""
Dev settings - for local development with docker-compose
"""

import dj_database_url

from .base import *


DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend"]

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {"default": dj_database_url.config()}

# Redis - from docker-compose
REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
    }
}

PLATFORM_ACCOUNTS = {
    "REDIRECT_URI": "http://localhost:8000/accounts/callback/",
    "CLIENT_ID": os.environ.get("LABS_CLIENT_ID", "clientid"),
    "CLIENT_SECRET": os.environ.get("LABS_CLIENT_SECRET", "supersecretclientsecret"),
    "PLATFORM_URL": "https://platform.pennlabs.org",
    "CUSTOM_ADMIN": False,
}

# CORS - allow frontend in development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
