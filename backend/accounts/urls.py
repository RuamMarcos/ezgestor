from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('processar-pagamento/', views.ProcessarPagamentoView.as_view(), name='processar-pagamento'),
]