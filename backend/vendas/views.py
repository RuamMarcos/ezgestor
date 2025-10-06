from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.db import transaction
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

    def update(self, request, *args, **kwargs):
        """
        Atualiza uma venda. Permite editar quantidade e dados do cliente.
        - Se a quantidade mudar, ajusta o estoque do produto correspondente
          e recalcula o preço total com base no preço de venda atual do produto.
        """
        partial = kwargs.pop('partial', True)
        instance: Venda = self.get_object()

        # Valores atuais
        old_qty = instance.quantidade
        produto: Produto = instance.produto

        # Campos editáveis
        new_qty = request.data.get('quantidade', old_qty)
        try:
            new_qty = int(new_qty)
            if new_qty <= 0:
                return Response({"quantidade": "A quantidade deve ser maior que zero."}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError):
            return Response({"quantidade": "Quantidade inválida."}, status=status.HTTP_400_BAD_REQUEST)

        diff = new_qty - old_qty

        with transaction.atomic():
            if diff != 0:
                # Aumentou a quantidade vendida -> reduz estoque adicional
                # Diminuiu a quantidade vendida -> devolve para o estoque
                if diff > 0 and produto.quantidade_estoque < diff:
                    return Response(
                        {"quantidade": f"Estoque insuficiente. Disponível: {produto.quantidade_estoque} unidades."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                produto.quantidade_estoque = produto.quantidade_estoque - diff
                produto.save(update_fields=['quantidade_estoque'])

            # Atualiza campos do cliente se informados
            instance.cliente_nome = request.data.get('cliente_nome', instance.cliente_nome)
            instance.cliente_email = request.data.get('cliente_email', instance.cliente_email)
            instance.cliente_telefone = request.data.get('cliente_telefone', instance.cliente_telefone)

            # Atualiza quantidade e preço total
            instance.quantidade = new_qty
            instance.preco_total = produto.preco_venda * new_qty
            instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        # Encaminha para a mesma lógica de update permitindo parciais
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Ao excluir uma venda, devolve a quantidade vendida para o estoque.
        """
        instance: Venda = self.get_object()
        with transaction.atomic():
            produto: Produto = instance.produto
            produto.quantidade_estoque = produto.quantidade_estoque + instance.quantidade
            produto.save(update_fields=['quantidade_estoque'])
            instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)