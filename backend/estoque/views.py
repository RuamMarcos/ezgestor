from rest_framework import generics, permissions
from .models import Produto
from .serializers import ProdutoSerializer

class ProdutoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e criar produtos.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra os produtos pela empresa do usuário logado
        return Produto.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        # Associa o produto à empresa do usuário logado ao criar
        serializer.save(empresa=self.request.user.empresa)

class ProdutoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para ver, atualizar e deletar um produto específico.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id_produto'

    def get_queryset(self):
        # Garante que o usuário só possa acessar produtos da sua própria empresa
        return Produto.objects.filter(empresa=self.request.user.empresa)