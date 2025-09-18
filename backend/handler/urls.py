from django.urls import path
from .views import TesteAPIView

urlpatterns = [
    path('teste/', TesteAPIView.as_view(), name='teste-api'),

]