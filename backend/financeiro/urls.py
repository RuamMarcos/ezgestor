from django.urls import path
from .views import FinancialStatsView, LancamentoFinanceiroListView, LancamentoCategoriasView, DashboardStatsView, LancamentoFinanceiroDetailView

urlpatterns = [
    path('lancamentos/', LancamentoFinanceiroListView.as_view(), name='list-lancamentos'),
    path('lancamentos/<int:pk>/', LancamentoFinanceiroDetailView.as_view(), name='detail-lancamento'),
    path('stats/', FinancialStatsView.as_view(), name='financial-stats'), 
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('categorias/', LancamentoCategoriasView.as_view(), name='list-categorias-lancamentos'),
]