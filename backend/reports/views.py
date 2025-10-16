from datetime import datetime, date, time, timedelta
from django.http import HttpResponse, HttpResponseBadRequest
from django.template.loader import render_to_string
from django.utils import timezone
from django.db.models import Sum, F, Count, DecimalField, ExpressionWrapper, Value
from django.db.models.functions import Coalesce, TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from io import BytesIO
import zipfile
from django.utils.safestring import mark_safe


from vendas.models import Venda
from estoque.models import Produto
from financeiro.models import LancamentoFinanceiro


def parse_date(param: str | None) -> date | None:
    if not param:
        return None
    try:
        # Expecting YYYY-MM-DD
        return datetime.strptime(param, '%Y-%m-%d').date()
    except Exception:
        return None


# --- SVG helpers (module scope) ---
def svg_line_chart(values: list[float], width=520, height=120, padding=10) -> str:
    if not values:
        values = [0.0]
    max_v = max(values) or 1.0
    n = len(values)
    if n == 1:
        points = [(padding, height/2), (width - padding, height/2)]
    else:
        step_x = (width - 2*padding) / (n - 1)
        points = [
            (padding + i*step_x, height - padding - (v/max_v)*(height - 2*padding))
            for i, v in enumerate(values)
        ]
    pts = ' '.join(f"{x:.1f},{y:.1f}" for x, y in points)
    return f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">\
<polyline fill="none" stroke="#0D6EFD" stroke-width="2" points="{pts}" />\
</svg>'


def svg_bar_chart(values: list[float], labels: list[str] | None = None, width=520, height=140, padding=10) -> str:
    if not values:
        return f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg"></svg>'
    max_v = max(values) or 1.0
    n = len(values)
    bar_w = (width - 2*padding) / max(n, 1)
    rects = []
    for i, v in enumerate(values):
        bar_h = (v / max_v) * (height - 2*padding - 20)
        x = padding + i*bar_w
        y = height - padding - bar_h
        rects.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{bar_w*0.7:.1f}" height="{bar_h:.1f}" fill="#6F42C1" />')
    return f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">' + ''.join(rects) + '</svg>'


def svg_pie_chart(values: list[float], colors: list[str] | None = None, width=180, height=180) -> str:
    if not values:
        return f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg"></svg>'
    total = sum(values) or 1.0
    cx, cy = width/2, height/2
    r = min(cx, cy) - 4
    # Use stroke-dasharray pie via circle segments
    circ = 2 * 3.1415926535 * r
    acc = 0.0
    segs = []
    palette = colors or ["#0D6EFD", "#6F42C1", "#28A745", "#FD7E14", "#DC3545", "#17A2B8", "#6610F2", "#20C997"]
    for i, v in enumerate(values):
        frac = (v / total)
        seg_len = frac * circ
        color = palette[i % len(palette)]
        segs.append(
            f'<circle r="{r:.1f}" cx="{cx:.1f}" cy="{cy:.1f}" fill="transparent" stroke="{color}" stroke-width="{r:.2f}" stroke-dasharray="{seg_len:.2f} {circ - seg_len:.2f}" transform="rotate(-90 {cx:.1f} {cy:.1f}) translate(0,0)" stroke-dashoffset="{-acc:.2f}" />'
        )
        acc += seg_len
    return f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">' + ''.join(segs) + '</svg>'


# --- PDF helper with fallback (WeasyPrint -> xhtml2pdf) ---
def render_pdf_bytes(html_string: str, css_string: str | None = None) -> bytes:
    """Render HTML to PDF bytes. Try WeasyPrint first; fallback to xhtml2pdf if unavailable."""
    # Try WeasyPrint
    try:
        from weasyprint import HTML, CSS
        stylesheets = [CSS(string=css_string)] if css_string else None
        return HTML(string=html_string).write_pdf(stylesheets=stylesheets)
    except Exception:
        pass
    # Fallback to xhtml2pdf
    from xhtml2pdf import pisa
    if css_string:
        html_string = f"<style>{css_string}</style>\n" + html_string
    output = BytesIO()
    pisa.CreatePDF(src=html_string, dest=output)
    return output.getvalue()


class ExecutiveSummaryPDFView(APIView):
    """
    Gera o relatório 'Resumo Executivo do Período' em PDF.
    GET params:
      - start (YYYY-MM-DD)
      - end (YYYY-MM-DD)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        # Normalizar timezone
        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        # Filtros base por empresa (se houver no usuário)
        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)

        vendas_qs = Venda.objects.all()
        if empresa:
            vendas_qs = vendas_qs.filter(produto__empresa_id=empresa)
        if start_dt:
            vendas_qs = vendas_qs.filter(data_venda__gte=start_dt)
        if end_dt:
            vendas_qs = vendas_qs.filter(data_venda__lte=end_dt)

        lanc_qs = LancamentoFinanceiro.objects.all()
        if empresa:
            lanc_qs = lanc_qs.filter(empresa_id=empresa)
        if start_dt:
            lanc_qs = lanc_qs.filter(data_lancamento__gte=start_dt)
        if end_dt:
            lanc_qs = lanc_qs.filter(data_lancamento__lte=end_dt)

        # KPIs
        receita_total = vendas_qs.aggregate(total=Sum('preco_total'))['total'] or 0
        numero_vendas = vendas_qs.count()
        ticket_medio = float(receita_total) / numero_vendas if numero_vendas else 0.0

        # Margem bruta estimada: soma(qtd * (pv - pc))
        margem_estimada_qs = vendas_qs.annotate(
            lucro_unit=ExpressionWrapper(
                F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            lucro_total=ExpressionWrapper(
                F('quantidade') * (
                    F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))
                ),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            ),
        )
        margem_bruta = margem_estimada_qs.aggregate(total=Sum('lucro_total'))['total'] or 0

        # Produtos em baixo estoque
        produtos_low = Produto.objects.all()
        if empresa:
            produtos_low = produtos_low.filter(empresa_id=empresa)
        produtos_low = produtos_low.filter(ativo=True).filter(quantidade_estoque__lte=F('quantidade_minima_estoque'))
        baixo_estoque = produtos_low.count()

        # Top 5 produtos com margem estimada
        lucro_expr = ExpressionWrapper(
            F('quantidade') * (F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        top_produtos = (
            vendas_qs.values('produto__nome')
            .annotate(
                unidades=Sum('quantidade'),
                faturamento=Sum('preco_total'),
                margem=Sum(lucro_expr)
            )
            .order_by('-faturamento')[:5]
        )

        # Top 5 clientes (usando cliente_nome)
        top_clientes = (
            vendas_qs.values('cliente_nome')
            .annotate(qtd=Count('id_venda'), faturamento=Sum('preco_total'))
            .order_by('-faturamento')[:5]
        )

        # Entradas x Saídas (financeiro)
        total_entradas = lanc_qs.filter(tipo='entrada').aggregate(total=Sum('valor'))['total'] or 0
        total_saidas = lanc_qs.filter(tipo='saida').aggregate(total=Sum('valor'))['total'] or 0
        saldo_variacao = float(total_entradas) - float(total_saidas)

        # Variação vs período anterior (MoM/WoW) baseado no mesmo tamanho de janela
        variacao_percent = None
        if start and end:
            delta_days = (end - start).days or 0
            prev_end = start - timedelta(days=1)
            prev_start = prev_end - timedelta(days=delta_days)
            prev_start_dt = timezone.make_aware(datetime.combine(prev_start, time.min), tz)
            prev_end_dt = timezone.make_aware(datetime.combine(prev_end, time.max), tz)
            vendas_prev = Venda.objects.all()
            if empresa:
                vendas_prev = vendas_prev.filter(produto__empresa_id=empresa)
            vendas_prev = vendas_prev.filter(data_venda__gte=prev_start_dt, data_venda__lte=prev_end_dt)
            receita_prev = vendas_prev.aggregate(total=Sum('preco_total'))['total'] or 0
            if receita_prev and float(receita_prev) != 0.0:
                variacao_percent = ((float(receita_total) - float(receita_prev)) / float(receita_prev)) * 100.0

        # Séries para gráficos
        # Receita por dia (linha)
        # Determina o intervalo de datas para o gráfico
        chart_start = start or (timezone.now().date() - timedelta(days=29))
        chart_end = end or timezone.now().date()
        # Restringe ao filtro de vendas já aplicado
        daily = (
            vendas_qs
            .annotate(day=TruncDate('data_venda'))
            .values('day')
            .annotate(total=Sum('preco_total'))
            .order_by('day')
        )
        daily_map = {row['day']: float(row['total'] or 0) for row in daily}
        series_days = []
        series_vals = []
        d = chart_start
        while d <= chart_end:
            series_days.append(d)
            series_vals.append(daily_map.get(d, 0.0))
            d += timedelta(days=1)

        # Vendas por vendedor (barras)
        vendors = (
            vendas_qs
            .values('vendedor__first_name', 'vendedor__email')
            .annotate(total=Sum('preco_total'))
            .order_by('-total')
        )
        vendor_labels = []
        vendor_values = []
        for v in vendors[:8]:  # limita para caber bem na página
            name = v.get('vendedor__first_name') or (v.get('vendedor__email') or 'N/A')
            vendor_labels.append(str(name)[:12])
            vendor_values.append(float(v.get('total') or 0))

        revenue_svg = mark_safe(svg_line_chart(series_vals))
        vendors_svg = mark_safe(svg_bar_chart(vendor_values, vendor_labels))

        # Contexto para template
        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'kpis': {
                'receita_total': receita_total,
                'numero_vendas': numero_vendas,
                'ticket_medio': ticket_medio,
                'margem_bruta': margem_bruta,
                'baixo_estoque': baixo_estoque,
                'entradas': total_entradas,
                'saidas': total_saidas,
                'saldo_variacao': saldo_variacao,
            },
            'top_produtos': top_produtos,
            'top_clientes': top_clientes,
            'revenue_svg': revenue_svg,
            'vendors_svg': vendors_svg,
            'variacao_percent': variacao_percent,
        }

        html_string = render_to_string('reports/executive_summary.html', context)

        base_css = '''
            @page { size: A4; margin: 16mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .h-title { font-size: 18px; font-weight: bold; }
            .muted { color: #777; }
            .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; }
            .kpi { background: #f5f7fb; border: 1px solid #e8ecf3; border-radius: 8px; padding: 10px; }
            .kpi .label { font-size: 11px; color: #555; }
            .kpi .value { font-size: 16px; font-weight: bold; }
            .section { margin-top: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)

        filename = f"resumo_executivo_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class SalesPeriodPDFView(APIView):
    """Relatório de Vendas por Período (sumário + detalhado + gráficos)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        vendedor = request.GET.get('vendedor')  # email ou id, conforme desejado
        cliente = request.GET.get('cliente')
        produto = request.GET.get('produto')

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        vendas = Venda.objects.select_related('produto', 'vendedor').all()
        if empresa:
            vendas = vendas.filter(produto__empresa_id=empresa)
        if start_dt:
            vendas = vendas.filter(data_venda__gte=start_dt)
        if end_dt:
            vendas = vendas.filter(data_venda__lte=end_dt)
        if vendedor:
            vendas = vendas.filter(vendedor__email=vendedor) | vendas.filter(vendedor__id=vendedor)
        if cliente:
            vendas = vendas.filter(cliente_nome__icontains=cliente)
        if produto:
            vendas = vendas.filter(produto__nome__icontains=produto) | vendas.filter(produto__id=produto)

        # Sumário
        receita_total = vendas.aggregate(total=Sum('preco_total'))['total'] or 0
        numero_vendas = vendas.count()
        ticket_medio = float(receita_total) / numero_vendas if numero_vendas else 0.0
        unidades = vendas.aggregate(units=Sum('quantidade'))['units'] or 0
        # Desconto: apenas placeholder (se houver campo depois)
        desconto_total = 0
        margem_expr = ExpressionWrapper(
            F('quantidade') * (F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        margem_total = vendas.aggregate(total=Sum(margem_expr))['total'] or 0

        # Faturamento por dia (barras)
        daily = (
            vendas.annotate(day=TruncDate('data_venda')).values('day').annotate(total=Sum('preco_total')).order_by('day')
        )

        # Participação por produto (pizza)
        by_product = (
            vendas.values('produto__nome').annotate(total=Sum('preco_total')).order_by('-total')
        )

        # Renderização
        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'sumario': {
                'receita_total': receita_total,
                'numero_vendas': numero_vendas,
                'ticket_medio': ticket_medio,
                'unidades': unidades,
                'desconto_total': desconto_total,
                'margem_total': margem_total,
            },
            'vendas': vendas.order_by('-data_venda')[:1000],  # limite para não explodir a página
            'daily': list(daily),
            'by_product': list(by_product[:12]),
        }

        html_string = render_to_string('reports/sales_period.html', context)
        base_css = '''
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }
            h3 { margin: 10px 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)
        filename = f"vendas_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ProductRankingPDFView(APIView):
    """Relatório de Ranking de Produtos (faturamento e lucratividade)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        top_n = int(request.GET.get('top', '20') or 20)
        excluir_inativos = request.GET.get('excluir_inativos', 'true').lower() in {'1', 'true', 'yes'}

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        vendas = Venda.objects.select_related('produto').all()
        if empresa:
            vendas = vendas.filter(produto__empresa_id=empresa)
        if start_dt:
            vendas = vendas.filter(data_venda__gte=start_dt)
        if end_dt:
            vendas = vendas.filter(data_venda__lte=end_dt)
        if excluir_inativos:
            vendas = vendas.filter(produto__ativo=True)

        receita_periodo = vendas.aggregate(total=Sum('preco_total'))['total'] or 0
        lucro_expr = ExpressionWrapper(
            F('quantidade') * (F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        ranking = (
            vendas.values('produto__id', 'produto__nome', 'produto__quantidade_estoque', 'produto__quantidade_minima_estoque')
            .annotate(unidades=Sum('quantidade'), faturamento=Sum('preco_total'), margem=Sum(lucro_expr))
            .order_by('-faturamento')
        )

        # % participação na receita
        ranking_list = []
        for r in ranking[:top_n]:
            part = (float(r['faturamento']) / float(receita_periodo)) * 100.0 if receita_periodo else 0.0
            status = 'baixo_estoque' if (r['produto__quantidade_estoque'] or 0) <= (r['produto__quantidade_minima_estoque'] or 0) else 'ok'
            ranking_list.append({
                **r,
                'participacao': part,
                'status': status,
            })

        # Curva ABC
        cumul = 0.0
        for r in ranking_list:
            cumul += float(r['faturamento'] or 0)
            perc = (cumul / float(receita_periodo)) * 100.0 if receita_periodo else 0.0
            if perc <= 80:
                r['abc'] = 'A'
            elif perc <= 95:
                r['abc'] = 'B'
            else:
                r['abc'] = 'C'

        # Produtos sem giro
        vendidos_ids = {r['produto__id'] for r in ranking}
        produtos_sem_giro = Produto.objects.all()
        if empresa:
            produtos_sem_giro = produtos_sem_giro.filter(empresa_id=empresa)
        if excluir_inativos:
            produtos_sem_giro = produtos_sem_giro.filter(ativo=True)
        produtos_sem_giro = produtos_sem_giro.exclude(id_produto__in=vendidos_ids)

        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'receita_periodo': receita_periodo,
            'ranking': ranking_list,
            'produtos_sem_giro': produtos_sem_giro[:100],
        }

        html_string = render_to_string('reports/product_ranking.html', context)
        base_css = '''
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }
            h3 { margin: 10px 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)

        filename = f"ranking_produtos_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ReportsBundleZipView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        if end and start and end < start:
            return HttpResponseBadRequest('Parâmetros inválidos: end < start')

        files: list[tuple[str, bytes]] = []
        try:
            # Reuse endpoints' logic minimally with summaries
            today = timezone.now().date()
            s = start or today.replace(day=1)
            e = end or today

            # 1) Exec Summary (lightweight)
            vendas_qs = Venda.objects.filter(data_venda__date__gte=s, data_venda__date__lte=e)
            total = float(
                vendas_qs.aggregate(
                    t=Coalesce(
                        Sum('preco_total'),
                        Value(0),
                        output_field=DecimalField(max_digits=12, decimal_places=2)
                    )
                )['t'] or 0
            )
            series = [float(v) for v in []]
            html = render_to_string('reports/executive_summary.html', {
                'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'), 'empresa_nome': '—',
                'kpis': { 'receita_total': total, 'numero_vendas': vendas_qs.count(), 'ticket_medio': 0, 'margem_bruta': 0, 'baixo_estoque': 0, 'entradas': 0, 'saidas': 0, 'saldo_variacao': 0 },
                'top_produtos': [], 'top_clientes': [], 'revenue_svg': mark_safe(svg_line_chart(series)), 'vendors_svg': mark_safe(svg_bar_chart([])), 'variacao_percent': 0,
            })
            pdf = render_pdf_bytes(html, '@page { size: A4; margin: 16mm; } body { font-family: Arial; font-size: 12px; }')
            files.append((f'01_resumo_executivo_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 2) Vendas por período (skeleton)
            html = render_to_string('reports/sales_period.html', {
                'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'), 'empresa_nome': '—',
                'sumario': { 'receita_total': total, 'numero_vendas': 0, 'ticket_medio': 0, 'unidades': 0, 'desconto_total': 0, 'margem_total': 0 },
                'vendas': [], 'daily': [], 'by_product': [],
            })
            pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial; font-size: 11px; }')
            files.append((f'02_vendas_periodo_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 3) Ranking de produtos (skeleton)
            html = render_to_string('reports/product_ranking.html', {
                'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'), 'empresa_nome': '—',
                'receita_periodo': total, 'ranking': [], 'produtos_sem_giro': [],
            })
            pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial; font-size: 11px; }')
            files.append((f'03_ranking_produtos_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 4-10 placeholders as PDFs
            for idx, name in enumerate([
                '04_performance_vendedor', '05_vendas_por_cliente', '06_posicao_valuation_estoque',
                '07_sugestao_compra', '08_fluxo_caixa', '09_kardex', '10_dre_simplificada'
            ], start=4):
                html = f"<html><body><h1>{name.replace('_', ' ').title()}</h1><p>Relatório em desenvolvimento</p></body></html>"
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 20mm; } body { font-family: Arial; }')
                files.append((f'{name}.pdf', pdf))

        except Exception as e:
            files.append(("erro.txt", str(e).encode('utf-8')))

        mem = BytesIO()
        with zipfile.ZipFile(mem, mode='w', compression=zipfile.ZIP_DEFLATED) as zf:
            for fname, content in files:
                zf.writestr(fname, content)
        mem.seek(0)
        filename = f"relatorios_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.zip"
        resp = HttpResponse(mem.read(), content_type='application/zip')
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp
        filename = f"ranking_produtos_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


# Placeholder endpoints for remaining reports (to be implemented)
class SellerPerformancePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de Performance por Vendedor ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class SalesByCustomerPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de Vendas por Cliente ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class StockPositionPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de Posição e Valuation de Estoque ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class ReplenishmentSuggestionPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de Sugestão de Compra ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class CashflowPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de Fluxo de Caixa ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class KardexPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de Movimentação (Kardex) ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)


class DresimplificadaPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'Relatório de DRE Simplificada ainda não implementado.'}, status=status.HTTP_501_NOT_IMPLEMENTED)
