from rest_framework import generics, permissions, status, views
from .models import Produto
from .serializers import ProdutoSerializer, QuickAddSerializer, AddStockSerializer
from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework.response import Response

class ProdutoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e criar produtos.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Produto.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)


class ProdutoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para ver, atualizar e deletar um produto específico.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_produto'

    def get_queryset(self):
        return Produto.objects.filter(empresa=self.request.user.empresa)


class ProdutoQuickUpdateView(views.APIView):
    """
    View para adicionar estoque rapidamente a um produto existente.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = QuickAddSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quick_add_string = serializer.validated_data['quick_add_string']

        try:
            codigo, quantidade_str = quick_add_string.split(':')
            quantidade = int(quantidade_str)
            if quantidade <= 0:
                raise ValueError("A quantidade deve ser um número positivo.")
        except ValueError as e:
            return Response(
                {"detail": f"Formato inválido. Use 'código:quantidade'. Detalhe: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        empresa = request.user.empresa
        
        try:
            produto = Produto.objects.get(empresa=empresa, codigo_do_produto=codigo.strip())
        except Produto.DoesNotExist:
             return Response(
                {"detail": f"Produto com o código '{codigo.strip()}' não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        produto.quantidade_estoque = models.F('quantidade_estoque') + quantidade
        produto.save(update_fields=['quantidade_estoque'])
        
        # Recarrega o objeto do banco para obter o valor atualizado
        produto.refresh_from_db()

        response_serializer = ProdutoSerializer(produto)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class AddStockView(views.APIView):
    """
    View para adicionar estoque a um produto específico por ID.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id_produto, *args, **kwargs):
        serializer = AddStockSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quantidade = serializer.validated_data['quantity']

        empresa = request.user.empresa
        produto = get_object_or_404(Produto, id_produto=id_produto, empresa=empresa)

        produto.quantidade_estoque = models.F('quantidade_estoque') + quantidade
        produto.save(update_fields=['quantidade_estoque'])
        
        produto.refresh_from_db()

        response_serializer = ProdutoSerializer(produto)
        return Response(response_serializer.data, status=status.HTTP_200_OK)