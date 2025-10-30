# backend/logs/views.py

from rest_framework import generics, permissions, pagination
from .models import Log
from .serializers import LogSerializer
from accounts.permissions import IsAdminUser # <-- Importar sua permissão

class StandardResultsSetPagination(pagination.PageNumberPagination):
    """
    Paginação padrão para os logs (igual à de outros apps).
    """
    page_size = 15 # Pode ajustar este número
    page_size_query_param = 'page_size'
    max_page_size = 100

class LogListView(generics.ListAPIView):
    """
    View para listar TODOS os logs de auditoria da empresa.
    Acessível apenas pelo Dono da Empresa.
    """
    serializer_class = LogSerializer
    pagination_class = StandardResultsSetPagination

    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        """
        Filtra os logs para mostrar apenas os da empresa do usuário logado.
        """

        empresa_usuario = self.request.user.empresa

        return Log.objects.filter(
            user__empresa=empresa_usuario
        ).order_by('-action_time')