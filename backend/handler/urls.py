from django.urls import path
from .views import TesteAPIView
from .views import ApiGatewayView

urlpatterns = [
    path('teste/', TesteAPIView.as_view(), name='teste-api'),
    path('', ApiGatewayView.as_view(), name='api_gateway'),
]
