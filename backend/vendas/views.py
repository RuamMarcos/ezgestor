from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Venda
from .serializers import VendaSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class VendaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar vendas.
    A busca pode ser feita por nome do produto ou email do vendedor.
    """
    serializer_class = VendaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Filtra as vendas para a empresa do usuário e aplica a busca.
        """
        user = self.request.user
        queryset = Venda.objects.filter(produto__empresa=user.empresa)

        search_term = self.request.query_params.get('search', None)
        if search_term:
            # Aplica a busca por nome do produto OU email do vendedor
            queryset = queryset.filter(
                Q(produto__nome__icontains=search_term) |
                Q(vendedor__email__icontains=search_term)
            ).distinct()

        return queryset