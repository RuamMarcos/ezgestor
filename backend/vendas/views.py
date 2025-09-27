from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Venda
from .serializers import VendaSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 100

class VendaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite visualizar as vendas.
    Suporta pesquisa por nome do produto ou nome do vendedor.
    Ex: /api/vendas/?search=Camiseta
    """
    queryset = Venda.objects.select_related('produto', 'vendedor').all()
    serializer_class = VendaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    # Filtros de pesquisa
    filter_backends = [filters.SearchFilter]
    search_fields = ['produto__nome', 'vendedor__username']

    def get_queryset(self):
        # Garante que os usuários só vejam as vendas da própria empresa
        empresa_usuario = self.request.user.empresa
        return self.queryset.filter(produto__empresa=empresa_usuario)