from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendaViewSet

router = DefaultRouter()
router.register(r'', VendaViewSet, basename='venda')

urlpatterns = [
    path('', include(router.urls)),
]