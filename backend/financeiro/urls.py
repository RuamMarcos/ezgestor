from django.urls import path
from .views import FinancialStatsView, LancamentoFinanceiroListView

urlpatterns = [
    path('lancamentos/', LancamentoFinanceiroListView.as_view(), name='list-lancamentos'),
    path('stats/', FinancialStatsView.as_view(), name='financial-stats'), 
]