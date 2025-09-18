from django.urls import path
from .views import RegisterUser

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
]