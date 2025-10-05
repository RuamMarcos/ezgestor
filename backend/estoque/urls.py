from django.urls import path
from .views import ProdutoListCreateView, ProdutoDetailView, ProdutoQuickUpdateView, AddStockView

urlpatterns = [
    path('produtos/', ProdutoListCreateView.as_view(), name='produto-list-create'),
    path('produtos/<int:id_produto>/', ProdutoDetailView.as_view(), name='produto-detail'),
    path('produtos/quick-add/', ProdutoQuickUpdateView.as_view(), name='produto-quick-add'),
    path('produtos/<int:id_produto>/add-stock/', AddStockView.as_view(), name='produto-add-stock'),
]