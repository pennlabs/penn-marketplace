"""
Production settings
"""

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from .base import *


DEBUG = False

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

DATABASES = {
    "default": dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    )
}

REDIS_URL = os.environ.get("REDIS_URL")
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }

PLATFORM_ACCOUNTS = {
    "REDIRECT_URI": os.environ.get("LABS_REDIRECT_URI"),
    "CLIENT_ID": os.environ.get("LABS_CLIENT_ID"),
    "CLIENT_SECRET": os.environ.get("LABS_CLIENT_SECRET"),
    "PLATFORM_URL": "https://platform.pennlabs.org",
    "CUSTOM_ADMIN": False,
}

# Production always uses S3 and requires its own bucket setting.
AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME", "").strip()
if not AWS_STORAGE_BUCKET_NAME:
    raise ImproperlyConfigured("AWS_STORAGE_BUCKET_NAME is required in production.")
STORAGES = S3_STORAGES

# change if domain changes from pennmarketplace
CORS_ALLOWED_ORIGINS = [
    "https://pennmarketplace.com",
    "https://www.pennmarketplace.com",
]

# security settings for production
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
