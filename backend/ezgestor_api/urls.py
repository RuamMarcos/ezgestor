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
from django.urls import path, re_path
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Default page → redirect to the built SPA shell served by WhiteNoise
    path('', RedirectView.as_view(url='/static/index.html', permanent=False), name='root'),
    # SPA fallback: let React Router handle client-side routes
    re_path(r'^(?!admin/|api/).*$', RedirectView.as_view(url='/static/index.html', permanent=False), name='spa-fallback'),
]
