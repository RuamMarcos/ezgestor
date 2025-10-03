from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Venda
from .serializers import VendaSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CustomSearchFilter(filters.SearchFilter):
    def filter_queryset(self, request, queryset, view):
        search_terms = self.get_search_terms(request)
        if not search_terms:
            return queryset

        # Constrói uma consulta que busca por nome do produto ou primeiro/último nome do vendedor
        query = Q()
        for term in search_terms:
            query |= Q(produto__nome__icontains=term) | \
                     Q(vendedor__first_name__icontains=term) | \
                     Q(vendedor__last_name__icontains=term)
        
        return queryset.filter(query).distinct()

class VendaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite visualizar as vendas.
    """
    queryset = Venda.objects.select_related('produto', 'vendedor').all()
    serializer_class = VendaSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    filter_backends = [CustomSearchFilter]
    search_fields = ['produto__nome', 'vendedor__username']

    def get_queryset(self):
        # Garante que os usuários só vejam as vendas da própria empresa
        empresa_usuario = self.request.user.empresa
        return self.queryset.filter(produto__empresa=empresa_usuario)