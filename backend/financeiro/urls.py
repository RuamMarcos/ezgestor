from django.urls import path
from .views import FinancialStatsView, LancamentoFinanceiroListView, LancamentoCategoriasView

urlpatterns = [
    path('lancamentos/', LancamentoFinanceiroListView.as_view(), name='list-lancamentos'),
    path('stats/', FinancialStatsView.as_view(), name='financial-stats'), 
    path('categorias/', LancamentoCategoriasView.as_view(), name='list-categorias-lancamentos'),

]