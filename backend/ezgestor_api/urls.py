"""
URL configuration for ezgestor_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.http import HttpResponse, HttpResponseNotFound
from django.conf import settings
from pathlib import Path






def spa_200(request):
    """Serve built index.html with HTTP 200 at the original URL (no redirect)."""
    candidate_paths = [
        Path(getattr(settings, 'STATIC_ROOT', '')) / 'index.html',
        Path(getattr(settings, 'BASE_DIR', '.')) / 'staticfiles' / 'index.html',
        Path(getattr(settings, 'BASE_DIR', '.')) / 'frontend_dist' / 'index.html',
    ]

    for path in candidate_paths:
        if path and path.exists():
            html = path.read_text(encoding='utf-8')
            return HttpResponse(html, content_type='text/html; charset=utf-8')

    return HttpResponseNotFound('index.html not found. Build the frontend or ensure it is collected to staticfiles.')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Default page → serve the SPA shell with HTTP 200
    path('', spa_200, name='root'),
    # SPA fallback: let React Router handle client-side routes
    re_path(r'^(?!admin/|api/).*$', spa_200, name='spa-fallback'),
    path('accounts/', include('accounts.urls')),
]
