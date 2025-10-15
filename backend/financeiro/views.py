from rest_framework import generics, permissions
from .models import LancamentoFinanceiro
from .serializers import LancamentoFinanceiroSerializer
from rest_framework import views
from rest_framework.response import Response
from django.db.models import Sum, F
from django.db.models.functions import Coalesce
from django.db.models import DecimalField
from rest_framework.pagination import PageNumberPagination
from vendas.views import StandardResultsSetPagination
from django.utils import timezone
from vendas.models import Venda
from estoque.models import Produto

class LancamentoFinanceiroListView(generics.ListAPIView):
    """
    View para listar os lançamentos financeiros (extrato do fluxo de caixa).
    Filtra os lançamentos pela empresa do usuário logado.
    Suporte a filtros: search (busca na descrição) e categoria.
    """
    serializer_class = LancamentoFinanceiroSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Garante que o usuário só possa ver os lançamentos da sua própria empresa
        empresa_usuario = self.request.user.empresa
        queryset = LancamentoFinanceiro.objects.filter(empresa=empresa_usuario).order_by('-data_lancamento')
        
        # Filtro de pesquisa na descrição
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(descricao__icontains=search)
        
        # Filtro por categoria
        categoria = self.request.query_params.get('categoria', None)
        if categoria:
            queryset = queryset.filter(categoria=categoria)
        
        # Filtro por tipo (entrada/saida)
        tipo = self.request.query_params.get('tipo', None)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        return queryset
    
class LancamentoCategoriasView(views.APIView):
    """
    Retorna uma lista de todas as categorias de lançamento distintas
    para a empresa do usuário logado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa
        categorias = LancamentoFinanceiro.objects.filter(
            empresa=empresa
        ).exclude(
            categoria__isnull=True
        ).exclude(
            categoria__exact=''
        ).values_list(
            'categoria', flat=True
        ).distinct().order_by('categoria')
        
        return Response(list(categorias))
    
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


class DashboardStatsView(views.APIView):
    """
    Endpoint de KPIs do Dashboard (mensal):
    - monthlyRevenue: Soma de entradas (financeiro) do mês atual
    - salesCount: Quantidade de vendas no mês atual
    - lowStockItems: Quantidade de produtos com estoque baixo (<= mínimo)
    - estimatedProfit: Aproximação de lucro (Σ (preco_venda - preco_custo) * quantidade) no mês atual
    - recentSales: Últimas vendas (id, clientName, description, value)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa
        now = timezone.localtime()

        # Receita mensal a partir dos lançamentos do mês (entradas)
        monthly_revenue = LancamentoFinanceiro.objects.filter(
            empresa=empresa,
            tipo='entrada',
            data_lancamento__year=now.year,
            data_lancamento__month=now.month,
        ).aggregate(total=Coalesce(Sum('valor'), 0, output_field=DecimalField()))['total']

        # Vendas do mês
        vendas_mes = Venda.objects.filter(
            produto__empresa=empresa,
            data_venda__year=now.year,
            data_venda__month=now.month,
        )
        sales_count = vendas_mes.count()

        # Lucro estimado: Σ (preco_venda * qtd) - Σ (preco_custo * qtd)
        total_faturamento = vendas_mes.aggregate(
            total=Coalesce(Sum(F('produto__preco_venda') * F('quantidade')), 0, output_field=DecimalField())
        )['total']
        total_custo = vendas_mes.aggregate(
            total=Coalesce(Sum(F('produto__preco_custo') * F('quantidade')), 0, output_field=DecimalField())
        )['total']
        estimated_profit = (total_faturamento or 0) - (total_custo or 0)

        # Produtos com baixo estoque
        low_stock_items = Produto.objects.filter(
            empresa=empresa,
            ativo=True,
            quantidade_estoque__lte=F('quantidade_minima_estoque')
        ).count()

        # Vendas recentes (limite 5)
        recent_qs = Venda.objects.filter(produto__empresa=empresa).order_by('-data_venda')[:5]
        recent_sales = []
        for v in recent_qs:
            client_name = v.cliente_nome or (v.vendedor.first_name if getattr(v, 'vendedor', None) and v.vendedor.first_name else '—')
            recent_sales.append({
                'id': v.id_venda,
                'clientName': client_name,
                'description': v.produto.nome if v.produto else '—',
                'value': v.preco_total,
                'date': v.data_venda,
            })

        data = {
            'monthlyRevenue': monthly_revenue,
            'salesCount': sales_count,
            'lowStockItems': low_stock_items,
            'estimatedProfit': estimated_profit,
            'recentSales': recent_sales,
        }

        return Response(data)