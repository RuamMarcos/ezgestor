# backend/logs/views.py

from rest_framework import generics, permissions, pagination
from .models import Log
from .serializers import LogSerializer
from accounts.permissions import IsAdminUser

class StandardResultsSetPagination(pagination.PageNumberPagination):
    """
    Paginação padrão para os logs (igual à de outros apps).
    """
    page_size = 15
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
        
        Adiciona filtros opcionais por 'user_id' e 'action_type'.
        """
        empresa_usuario = self.request.user.empresa
        
        queryset = Log.objects.filter(
            user__empresa=empresa_usuario
        ).select_related('user').order_by('-action_time')
        
        user_id = self.request.query_params.get('user_id', None)
        action_type = self.request.query_params.get('action_type', None)

        if user_id:
            queryset = queryset.filter(user__id=user_id)
        
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        return queryset