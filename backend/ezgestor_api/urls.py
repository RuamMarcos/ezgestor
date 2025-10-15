from django.contrib import admin
from django.urls import path, re_path, include
from django.http import HttpResponse, HttpResponseNotFound
from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path
from handler.views import ApiRootView 



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
    # Namespaced API routes
    path('api/accounts/', include('accounts.urls')),
    path('api/handler/', include('handler.urls')),
    path('api/estoque/', include('estoque.urls')),
    path('api/vendas/', include('vendas.urls')),
    path('api/financeiro/', include('financeiro.urls')),
    # SPA routes (always last)
    path('', spa_200, name='root'),
    # Exclude media and static from SPA fallback to avoid intercepting asset requests
    re_path(r'^(?!admin/|api/|media/|static/).*$', spa_200, name='spa-fallback'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



