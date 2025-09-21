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
    path('accounts/', include('accounts.urls')),
    path('api/', include('handler.urls')),  # <-- Adicionar  rotas de API aqui
    # Outras rotas de API, se houver
    # Rotas do SPA sempre por último:
    path('', spa_200, name='root'),
    re_path(r'^(?!admin/|accounts/|handler/).*$', spa_200, name='spa-fallback'),
]



