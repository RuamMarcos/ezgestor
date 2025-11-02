# backend/logs/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.LogListView.as_view(), name='log-list'),
]