from rest_framework import generics, permissions
from .models import LancamentoFinanceiro
from .serializers import LancamentoFinanceiroSerializer
from rest_framework import views
from rest_framework.response import Response
from django.db.models import Sum, F, Q
from django.db.models.functions import Coalesce
from django.db.models import DecimalField
from rest_framework.pagination import PageNumberPagination
from vendas.views import StandardResultsSetPagination
from django.utils import timezone
from vendas.models import Venda
from estoque.models import Produto
from django.db.models.functions import TruncDate, TruncMonth

from datetime import timedelta, date

class LancamentoFinanceiroListView(generics.ListCreateAPIView):
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
    
class LancamentoFinanceiroDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para ler, atualizar ou deletar um lançamento financeiro específico.
    """
    serializer_class = LancamentoFinanceiroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Garante que o usuário só possa acessar/modificar
        # lançamentos da sua própria empresa.
        empresa_usuario = self.request.user.empresa
        return LancamentoFinanceiro.objects.filter(empresa=empresa_usuario)

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


class CashFlowSeriesView(views.APIView):
    """
    Aggregated time series for inflows vs outflows for the authenticated user's empresa.
    Query params:
      - timeframe: '7days' | '30days' | 'currentMonth' | '12months'
    Response shape:
      { timeframe, start, end, data: [{ period, inflows, outflows, net }] }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa
        timeframe = request.query_params.get('timeframe', '30days')

        now = timezone.localtime()

        # Determine range and bucket function
        if timeframe == '7days':
            end_date = now.date()
            start_date = end_date - timedelta(days=6)
            bucket = TruncDate('data_lancamento')
            label_fn = lambda d: f"{d.day:02d}/{d.month:02d}"
            periods = [start_date + timedelta(days=i) for i in range(0, 7)]
            is_monthly = False
        elif timeframe == 'currentMonth':
            end_date = now.date()
            start_date = date(now.year, now.month, 1)
            days = (end_date - start_date).days + 1
            bucket = TruncDate('data_lancamento')
            label_fn = lambda d: f"{d.day:02d}/{d.month:02d}"
            periods = [start_date + timedelta(days=i) for i in range(0, days)]
            is_monthly = False
        elif timeframe == '12months':
            # Last 12 months including current
            end_date = date(now.year, now.month, 1)
            # start at 11 months ago first day
            start_year = end_date.year if end_date.month > 1 else end_date.year - 1
            start_month = ((end_date.month - 11 - 1) % 12) + 1
            if end_date.month - 11 <= 0:
                start_year = end_date.year - 1
            start_date = date(start_year, start_month, 1)
            bucket = TruncMonth('data_lancamento')
            month_names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            def add_months(y: int, m: int, add: int):
                total = (y * 12 + (m - 1)) + add
                ny = total // 12
                nm = (total % 12) + 1
                return ny, nm
            periods = []
            for i in range(12):
                y, m = add_months(start_date.year, start_date.month, i)
                periods.append(date(y, m, 1))
            label_fn = lambda d: f"{month_names[d.month-1]}/{str(d.year)[-2:]}"
            is_monthly = True
        else:  # default to 30days
            end_date = now.date()
            start_date = end_date - timedelta(days=29)
            bucket = TruncDate('data_lancamento')
            label_fn = lambda d: f"{d.day:02d}/{d.month:02d}"
            periods = [start_date + timedelta(days=i) for i in range(0, 30)]
            is_monthly = False

        # Base queryset within range (date range on date part for performance)
        base_filter = {
            'empresa': empresa,
            'data_lancamento__date__gte': start_date,
            'data_lancamento__date__lte': end_date if timeframe != '12months' else (now.date()),
        }
        qs = LancamentoFinanceiro.objects.filter(**base_filter)

        agg = (
            qs
            .annotate(bucket=bucket)
            .values('bucket')
            .annotate(
                inflows=Coalesce(Sum('valor', filter=Q(tipo='entrada')), 0, output_field=DecimalField()),
                outflows=Coalesce(Sum('valor', filter=Q(tipo='saida')), 0, output_field=DecimalField()),
            )
            .order_by('bucket')
        )

        bucket_to_vals = {}
        for row in agg:
            b = row['bucket']
            # Normalize bucket to date for mapping
            if is_monthly:
                normalized = date(b.year, b.month, 1)
            else:
                normalized = b if isinstance(b, date) else b.date()
            bucket_to_vals[normalized] = {
                'inflows': float(row['inflows']),
                'outflows': float(row['outflows']),
            }

        data = []
        for d in periods:
            vals = bucket_to_vals.get(d, {'inflows': 0.0, 'outflows': 0.0})
            net = vals['inflows'] - vals['outflows']
            data.append({
                'period': label_fn(d),
                'inflows': round(vals['inflows'], 2),
                'outflows': round(vals['outflows'], 2),
                'net': round(net, 2),
            })

        return Response({
            'timeframe': timeframe,
            'start': start_date,
            'end': end_date,
            'data': data,
        })