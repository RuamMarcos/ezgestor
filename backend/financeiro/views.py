from rest_framework import generics, permissions
from .models import LancamentoFinanceiro
from .serializers import LancamentoFinanceiroSerializer
from rest_framework import views
from rest_framework.response import Response
from django.db.models import Sum, F
from django.db.models.functions import Coalesce
from django.db.models import DecimalField

class LancamentoFinanceiroListView(generics.ListAPIView):
    """
    View para listar os lançamentos financeiros (extrato do fluxo de caixa).
    Filtra os lançamentos pela empresa do usuário logado.
    """
    serializer_class = LancamentoFinanceiroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Garante que o usuário só possa ver os lançamentos da sua própria empresa
        empresa_usuario = self.request.user.empresa
        return LancamentoFinanceiro.objects.filter(empresa=empresa_usuario)
    
class FinancialStatsView(views.APIView):
    """
    View para retornar as estatísticas financeiras da empresa.
    - Total de Entradas
    - Total de Saídas
    - Saldo Atual
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa

        # Calcula o total de entradas
        total_entradas = LancamentoFinanceiro.objects.filter(
            empresa=empresa, tipo='entrada'
        ).aggregate(
            total=Coalesce(Sum('valor'), 0, output_field=DecimalField())
        )['total']

        # Calcula o total de saídas
        total_saidas = LancamentoFinanceiro.objects.filter(
            empresa=empresa, tipo='saida'
        ).aggregate(
            total=Coalesce(Sum('valor'), 0, output_field=DecimalField())
        )['total']

        # Calcula o saldo
        saldo_atual = total_entradas - total_saidas

        data = {
            'total_entradas': total_entradas,
            'total_saidas': total_saidas,
            'saldo_atual': saldo_atual
        }

        return Response(data)