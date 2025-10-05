from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Venda
from .serializers import VendaSerializer, VendaCreateSerializer
from estoque.models import Produto
from estoque.serializers import ProdutoSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class VendaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, visualizar e criar vendas.
    A busca pode ser feita por nome do produto ou email do vendedor.
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return VendaCreateSerializer
        return VendaSerializer

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

    @action(detail=False, methods=['get'])
    def produtos_disponiveis(self, request):
        """
        Retorna produtos disponíveis para venda (com estoque > 0)
        """
        produtos = Produto.objects.filter(
            empresa=request.user.empresa,
            quantidade_estoque__gt=0
        ).order_by('nome')
        
        serializer = ProdutoSerializer(produtos, many=True)
        return Response(serializer.data)