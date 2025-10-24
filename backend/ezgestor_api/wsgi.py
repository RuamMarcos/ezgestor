"""
WSGI config for ezgestor_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import sys

from django.core.wsgi import get_wsgi_application
from django.core.exceptions import ImproperlyConfigured

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ezgestor_api.settings')

# Gracefully handle configuration errors to avoid verbose stack traces in container logs
try:
    application = get_wsgi_application()
except ImproperlyConfigured as exc:
    sys.stderr.write(f"Configuration error: {exc}\n")
    sys.stderr.flush()
    os._exit(3)
