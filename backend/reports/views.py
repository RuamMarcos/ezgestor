from datetime import datetime, date, time, timedelta
from django.http import HttpResponse, HttpResponseBadRequest
from django.template.loader import render_to_string
from django.utils import timezone
from django.db.models import Sum, F, Count, DecimalField, ExpressionWrapper, Value, Max, Q
from django.db.models.functions import Coalesce, TruncDate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from io import BytesIO, StringIO
import zipfile
import csv
from django.utils.safestring import mark_safe

from vendas.models import Venda
from estoque.models import Produto
from financeiro.models import LancamentoFinanceiro


def parse_date(param: str | None) -> date | None:
    if not param:
        return None
    try:
        return datetime.strptime(param, '%Y-%m-%d').date()
    except Exception:
        return None


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


def render_pdf_bytes(html_string: str, css_string: str | None = None) -> bytes:
    try:
        from weasyprint import HTML, CSS
        stylesheets = [CSS(string=css_string)] if css_string else None
        return HTML(string=html_string).write_pdf(stylesheets=stylesheets)
    except Exception:
        pass
    from xhtml2pdf import pisa
    if css_string:
        html_string = f"<style>{css_string}</style>\n" + html_string
    output = BytesIO()
    pisa.CreatePDF(src=html_string, dest=output)
    return output.getvalue()


class ExecutiveSummaryPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        vendas_qs = Venda.objects.select_related('produto', 'vendedor').all()
        if empresa:
            vendas_qs = vendas_qs.filter(produto__empresa_id=empresa)
        if start_dt:
            vendas_qs = vendas_qs.filter(data_venda__gte=start_dt)
        if end_dt:
            vendas_qs = vendas_qs.filter(data_venda__lte=end_dt)

        receita_total = vendas_qs.aggregate(total=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['total'] or 0
        numero_vendas = vendas_qs.count()
        ticket_medio = float(receita_total) / numero_vendas if numero_vendas else 0.0

        margem_expr = ExpressionWrapper(
            F('quantidade') * (F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        margem_bruta = vendas_qs.aggregate(total=Coalesce(Sum(margem_expr), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['total'] or 0

        produtos_low = Produto.objects.all()
        if empresa:
            produtos_low = produtos_low.filter(empresa_id=empresa)
        baixo_estoque = produtos_low.filter(ativo=True, quantidade_estoque__lte=F('quantidade_minima_estoque')).count()

        total_entradas = LancamentoFinanceiro.objects.filter(tipo='entrada', empresa_id=empresa if empresa else None)
        total_saidas = LancamentoFinanceiro.objects.filter(tipo='saida', empresa_id=empresa if empresa else None)
        if start_dt:
            total_entradas = total_entradas.filter(data_lancamento__gte=start_dt)
            total_saidas = total_saidas.filter(data_lancamento__gte=start_dt)
        if end_dt:
            total_entradas = total_entradas.filter(data_lancamento__lte=end_dt)
            total_saidas = total_saidas.filter(data_lancamento__lte=end_dt)
        total_entradas = total_entradas.aggregate(t=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
        total_saidas = total_saidas.aggregate(t=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
        saldo_variacao = float(total_entradas) - float(total_saidas)

        # Série de faturamento simples
        chart_start = start or (timezone.now().date() - timedelta(days=29))
        chart_end = end or timezone.now().date()
        daily = (
            vendas_qs.annotate(day=TruncDate('data_venda')).values('day').annotate(total=Sum('preco_total')).order_by('day')
        )
        daily_map = {r['day']: float(r['total'] or 0) for r in daily}
        series_vals = []
        d = chart_start
        while d <= chart_end:
            series_vals.append(daily_map.get(d, 0.0))
            d += timedelta(days=1)

        # CSV branch
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Período', start.strftime('%d/%m/%Y') if start else '-', end.strftime('%d/%m/%Y') if end else '-'])
            w.writerow(['Emitido em', timezone.now().strftime('%d/%m/%Y %H:%M')])
            w.writerow([])
            w.writerow(['Indicador', 'Valor'])
            w.writerow(['Receita Total', f"{float(receita_total):.2f}"])
            w.writerow(['Nº Vendas', f"{numero_vendas}"])
            w.writerow(['Ticket Médio', f"{ticket_medio:.2f}"])
            w.writerow(['Margem Bruta (estimada)', f"{float(margem_bruta):.2f}"])
            w.writerow(['Produtos com Baixo Estoque', f"{baixo_estoque}"])
            w.writerow(['Entradas (financeiro)', f"{float(total_entradas):.2f}"])
            w.writerow(['Saídas (financeiro)', f"{float(total_saidas):.2f}"])
            w.writerow(['Saldo (entradas - saídas)', f"{(float(total_entradas)-float(total_saidas)):.2f}"])
            data = out.getvalue().encode('utf-8-sig')
            resp = HttpResponse(data, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="resumo_executivo_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"'
            return resp

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
            'revenue_svg': mark_safe(svg_line_chart(series_vals)),
            'top_produtos': [],
            'top_clientes': [],
            'vendors_svg': mark_safe(svg_bar_chart([])),
            'variacao_percent': None,
        }
        html_string = render_to_string('reports/executive_summary.html', context)
        base_css = '''
            @page { size: A4; margin: 16mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #333; }
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

        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Data', 'Cliente', 'Vendedor', 'Produto', 'Quantidade', 'Valor'])
            for v in vendas.order_by('data_venda'):
                w.writerow([
                    v.data_venda.strftime('%d/%m/%Y %H:%M') if v.data_venda else '',
                    getattr(v, 'cliente_nome', '') or '',
                    (v.vendedor.first_name or v.vendedor.email) if getattr(v, 'vendedor', None) else '',
                    v.produto.nome if getattr(v, 'produto', None) else '',
                    int(v.quantidade or 0),
                    f"{float(v.preco_total or 0):.2f}",
                ])
            csv_bytes = out.getvalue().encode('utf-8-sig')
            filename = f"vendas_periodo_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

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
            vendas.values('produto__id_produto', 'produto__nome', 'produto__quantidade_estoque', 'produto__quantidade_minima_estoque')
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
        vendidos_ids = {r['produto__id_produto'] for r in ranking}
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

        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Produto', 'Unidades', 'Faturamento', 'Margem', 'Participação %', 'Status', 'Curva ABC'])
            for r in ranking_list:
                w.writerow([
                    r.get('produto__nome', ''),
                    int(r.get('unidades', 0) or 0),
                    f"{float(r.get('faturamento') or 0):.2f}",
                    f"{float(r.get('margem') or 0):.2f}",
                    f"{float(r.get('participacao') or 0):.2f}",
                    r.get('status', ''),
                    r.get('abc', ''),
                ])
            csv_bytes = out.getvalue().encode('utf-8-sig')
            filename = f"ranking_produtos_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

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
        out_format = request.GET.get('format', 'pdf').lower()
        vendedores_param = request.GET.get('vendedor')  # csv: emails or ids
        cliente_param = request.GET.get('cliente')
        produto_param = request.GET.get('produto')
        if end and start and end < start:
            return HttpResponseBadRequest('Parâmetros inválidos: end < start')

        files: list[tuple[str, bytes]] = []
        try:
            # Reuse endpoints' logic minimally with summaries
            today = timezone.now().date()
            s = start or today.replace(day=1)
            e = end or today

            # 1) Exec Summary (lightweight)
            vendas_qs = Venda.objects.select_related('produto', 'vendedor').filter(data_venda__date__gte=s, data_venda__date__lte=e)
            empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
            if empresa:
                vendas_qs = vendas_qs.filter(produto__empresa_id=empresa)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vendas_qs = vendas_qs.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vendas_qs = vendas_qs.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vendas_qs = vendas_qs.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
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
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Indicador', 'Valor'])
                w.writerow(['Receita Total', f"{float(total):.2f}"])
                w.writerow(['Nº Vendas', f"{vendas_qs.count()}"])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'01_resumo_executivo_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/executive_summary.html', {
                    'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'), 'empresa_nome': '—',
                    'kpis': { 'receita_total': total, 'numero_vendas': vendas_qs.count(), 'ticket_medio': 0, 'margem_bruta': 0, 'baixo_estoque': 0, 'entradas': 0, 'saidas': 0, 'saldo_variacao': 0 },
                    'top_produtos': [], 'top_clientes': [], 'revenue_svg': mark_safe(svg_line_chart(series)), 'vendors_svg': mark_safe(svg_bar_chart([])), 'variacao_percent': 0,
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 16mm; } body { font-family: Arial; font-size: 12px; }')
                files.append((f'01_resumo_executivo_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 2) Vendas por período (skeleton)
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Campo', 'Valor'])
                w.writerow(['Receita Total', f"{float(total):.2f}"])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'02_vendas_periodo_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/sales_period.html', {
                    'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'), 'empresa_nome': '—',
                    'sumario': { 'receita_total': total, 'numero_vendas': 0, 'ticket_medio': 0, 'unidades': 0, 'desconto_total': 0, 'margem_total': 0 },
                    'vendas': [], 'daily': [], 'by_product': [],
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial; font-size: 11px; }')
                files.append((f'02_vendas_periodo_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 3) Ranking de produtos (skeleton)
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Campo', 'Valor'])
                w.writerow(['Receita no período', f"{float(total):.2f}"])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'03_ranking_produtos_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/product_ranking.html', {
                    'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'), 'empresa_nome': '—',
                    'receita_periodo': total, 'ranking': [], 'produtos_sem_giro': [],
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial; font-size: 11px; }')
                files.append((f'03_ranking_produtos_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 4) Performance por Vendedor (real)
            tz = timezone.get_current_timezone()
            start_dt = timezone.make_aware(datetime.combine(s, time.min), tz) if s else None
            end_dt = timezone.make_aware(datetime.combine(e, time.max), tz) if e else None
            empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
            vendas = Venda.objects.select_related('vendedor', 'produto').all()
            if empresa:
                vendas = vendas.filter(produto__empresa_id=empresa)
            if start_dt:
                vendas = vendas.filter(data_venda__gte=start_dt)
            if end_dt:
                vendas = vendas.filter(data_venda__lte=end_dt)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vendas = vendas.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vendas = vendas.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vendas = vendas.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
            receita_total_periodo = vendas.aggregate(t=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
            lucro_expr = ExpressionWrapper(
                F('quantidade') * (F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
            by_seller = (
                vendas
                .values('vendedor__first_name', 'vendedor__email')
                .annotate(
                    vendas_count=Count('id_venda'),
                    faturamento=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                    margem=Coalesce(Sum(lucro_expr), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                )
                .order_by('-faturamento')
            )
            days_span = max(1, (e - s).days + 1)
            perf_rows, seller_bars = [], []
            for r in by_seller:
                faturamento = float(r['faturamento'] or 0)
                vendas_count = int(r['vendas_count'] or 0)
                ticket_medio = (faturamento / vendas_count) if vendas_count else 0.0
                media_diaria = faturamento / days_span if days_span else 0.0
                nome = r.get('vendedor__first_name') or (r.get('vendedor__email') or 'N/A')
                part = (faturamento / float(receita_total_periodo) * 100.0) if float(receita_total_periodo) else 0.0
                perf_rows.append({
                    'nome': nome,
                    'vendas': vendas_count,
                    'faturamento': faturamento,
                    'ticket_medio': ticket_medio,
                    'margem': float(r['margem'] or 0),
                    'media_diaria': media_diaria,
                    'participacao': part,
                })
                seller_bars.append(faturamento)
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Vendedor', 'Vendas', 'Faturamento', 'Ticket Médio', 'Margem', 'Média Diária', 'Participação %'])
                for r in perf_rows:
                    w.writerow([r['nome'], r['vendas'], f"{r['faturamento']:.2f}", f"{r['ticket_medio']:.2f}", f"{r['margem']:.2f}", f"{r['media_diaria']:.2f}", f"{r['participacao']:.2f}"])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'04_performance_vendedor_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/seller_performance.html', {
                    'periodo_inicio': s.strftime('%d/%m/%Y'),
                    'periodo_fim': e.strftime('%d/%m/%Y'),
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                    'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                    'rows': perf_rows,
                    'bars_svg': mark_safe(svg_bar_chart(seller_bars)),
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; } table { width: 100%; border-collapse: collapse; } th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; } th { background: #f0f3f8; }')
                files.append((f'04_performance_vendedor_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 5) Vendas por Cliente (real)
            vendas_cli = Venda.objects.all()
            if empresa:
                vendas_cli = vendas_cli.filter(produto__empresa_id=empresa)
            if start_dt:
                vendas_cli = vendas_cli.filter(data_venda__gte=start_dt)
            if end_dt:
                vendas_cli = vendas_cli.filter(data_venda__lte=end_dt)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vendas_cli = vendas_cli.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vendas_cli = vendas_cli.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vendas_cli = vendas_cli.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
            by_client = (
                vendas_cli.values('cliente_nome')
                .annotate(
                    compras=Count('id_venda'),
                    faturamento=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                    ultima_compra=Max('data_venda')
                )
                .order_by('-faturamento')
            )
            today = timezone.now().date()
            gap_days = 30
            rows, top10, recuperaveis = [], [], []
            for idx, r in enumerate(by_client[:50]):
                nome = r['cliente_nome'] or '—'
                fatura = float(r['faturamento'] or 0)
                compras = int(r['compras'] or 0)
                ticket = (fatura / compras) if compras else 0.0
                last = r['ultima_compra'].date() if r['ultima_compra'] else None
                recencia = (today - last).days if last else None
                obs = 'VIP' if idx < 10 else ('engajar' if (recencia and recencia >= gap_days) else '')
                row = {
                    'cliente': nome,
                    'ultima_compra': last.strftime('%d/%m/%Y') if last else '—',
                    'compras': compras,
                    'faturamento': fatura,
                    'ticket_medio': ticket,
                    'observacoes': obs,
                }
                rows.append(row)
                if idx < 10:
                    top10.append(row)
                if recencia and recencia >= gap_days:
                    recuperaveis.append(row)
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Cliente', 'Última Compra', 'Compras', 'Faturamento', 'Ticket Médio', 'Observações'])
                for r in rows:
                    w.writerow([r['cliente'], r['ultima_compra'], r['compras'], f"{r['faturamento']:.2f}", f"{r['ticket_medio']:.2f}", r['observacoes']])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'05_vendas_por_cliente_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/sales_by_customer.html', {
                    'periodo_inicio': s.strftime('%d/%m/%Y'),
                    'periodo_fim': e.strftime('%d/%m/%Y'),
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                    'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                    'rows': rows, 'top10': top10, 'recuperaveis': recuperaveis,
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; } table { width: 100%; border-collapse: collapse; } th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; } th { background: #f0f3f8; }')
                files.append((f'05_vendas_por_cliente_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 6) Posição/Valuation de Estoque (real)
            base_days = 30
            start_dt_sp = start_dt or (timezone.now() - timedelta(days=base_days))
            end_dt_sp = end_dt or timezone.now()
            produtos = Produto.objects.all()
            if empresa:
                produtos = produtos.filter(empresa_id=empresa)
            produtos = produtos.filter(ativo=True)
            vend_sp = Venda.objects.select_related('produto').filter(data_venda__gte=start_dt_sp, data_venda__lte=end_dt_sp)
            if empresa:
                vend_sp = vend_sp.filter(produto__empresa_id=empresa)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vend_sp = vend_sp.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vend_sp = vend_sp.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vend_sp = vend_sp.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
            by_prod = (
                vend_sp.values('produto__id_produto')
                .annotate(qtd=Coalesce(Sum('quantidade'), Value(0)))
                .values('produto__id_produto', 'qtd')
            )
            qtd_map = {r['produto__id_produto']: int(r['qtd'] or 0) for r in by_prod}
            days_cov = max(1, (end_dt_sp.date() - start_dt_sp.date()).days or base_days)
            rows_sp = []
            valor_total_custo = 0.0
            baixo_estoque = 0
            sem_giro = 0
            for p in produtos:
                avg = (qtd_map.get(p.id_produto, 0) / days_cov) if days_cov else 0.0
                custo = float(p.preco_custo or 0)
                valor_estoque = float(p.quantidade_estoque) * custo
                valor_total_custo += valor_estoque
                margem_pct = ((float(p.preco_venda) - custo) / float(p.preco_venda) * 100.0) if float(p.preco_venda or 0) else 0.0
                cobertura = (float(p.quantidade_estoque) / avg) if avg else None
                status = 'baixo' if p.quantidade_estoque <= (p.quantidade_minima_estoque or 0) else ('excesso' if (cobertura and cobertura > 90) else 'ok')
                if status == 'baixo':
                    baixo_estoque += 1
                if (qtd_map.get(p.id_produto, 0) or 0) == 0:
                    sem_giro += 1
                rows_sp.append({
                    'codigo': p.codigo_do_produto or p.id_produto,
                    'nome': p.nome,
                    'estoque': p.quantidade_estoque,
                    'estoque_min': p.quantidade_minima_estoque,
                    'custo_medio': custo,
                    'valor_estoque': valor_estoque,
                    'preco_venda': float(p.preco_venda or 0),
                    'margem_pct': margem_pct,
                    'cobertura': cobertura,
                    'status': status,
                })
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Código', 'Nome', 'Estoque', 'Estoque Mínimo', 'Custo Médio', 'Valor Estoque', 'Preço Venda', 'Margem %', 'Cobertura (dias)', 'Status'])
                for r in rows_sp:
                    w.writerow([r['codigo'], r['nome'], r['estoque'], r['estoque_min'], f"{r['custo_medio']:.2f}", f"{r['valor_estoque']:.2f}", f"{r['preco_venda']:.2f}", f"{r['margem_pct']:.2f}", (f"{r['cobertura']:.2f}" if r['cobertura'] is not None else ''), r['status']])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'06_posicao_valuation_estoque_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/stock_position.html', {
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                    'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                    'valor_total_custo': valor_total_custo,
                    'baixo_estoque': baixo_estoque,
                    'sem_giro': sem_giro,
                    'rows': rows_sp[:1000],
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 10mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; } table { width: 100%; border-collapse: collapse; } th, td { padding: 5px; border-bottom: 1px solid #e8ecf3; text-align: left; } th { background: #f0f3f8; }')
                files.append((f'06_posicao_valuation_estoque_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 7) Sugestão de Reposição (real)
            base_days_r = 30
            lead_time = 7
            safety = 3
            end_dt_r = end_dt or timezone.now()
            start_dt_r = end_dt_r - timedelta(days=base_days_r)
            produtos_r = Produto.objects.all()
            if empresa:
                produtos_r = produtos_r.filter(empresa_id=empresa)
            produtos_r = produtos_r.filter(ativo=True)
            vend_r = Venda.objects.select_related('produto').filter(data_venda__gte=start_dt_r, data_venda__lte=end_dt_r)
            if empresa:
                vend_r = vend_r.filter(produto__empresa_id=empresa)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vend_r = vend_r.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vend_r = vend_r.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vend_r = vend_r.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
            by_prod_r = (
                vend_r.values('produto__id_produto')
                .annotate(qtd=Coalesce(Sum('quantidade'), Value(0)))
                .values('produto__id_produto', 'qtd')
            )
            qtd_map_r = {r['produto__id_produto']: int(r['qtd'] or 0) for r in by_prod_r}
            days_r = max(1, base_days_r)
            suggestions = []
            today = timezone.now().date()
            for p in produtos_r:
                avg = (qtd_map_r.get(p.id_produto, 0) / days_r) if days_r else 0.0
                cobertura = (float(p.quantidade_estoque) / avg) if avg else None
                ruptura_prevista = (today + timedelta(days=int(cobertura))) if cobertura else None
                qtd_sugerida = max(0.0, (lead_time + safety) * avg - float(p.quantidade_estoque))
                obs = ''
                if cobertura is None:
                    obs = 'Sem giro'
                elif cobertura <= lead_time + safety:
                    obs = 'Alta prioridade'
                suggestions.append({
                    'produto': p.nome,
                    'media_diaria': avg,
                    'estoque_atual': p.quantidade_estoque,
                    'cobertura': cobertura,
                    'ruptura_prevista': ruptura_prevista.strftime('%d/%m/%Y') if ruptura_prevista else '—',
                    'qtd_sugerida': qtd_sugerida,
                    'obs': obs,
                })
            suggestions.sort(key=lambda x: (x['cobertura'] if x['cobertura'] is not None else 1e9))
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Produto', 'Média Diária', 'Estoque Atual', 'Cobertura (dias)', 'Ruptura Prevista', 'Qtd. Sugerida', 'Observações'])
                for r in suggestions:
                    w.writerow([r['produto'], f"{r['media_diaria']:.2f}", r['estoque_atual'], f"{r['cobertura']:.2f}" if r['cobertura'] is not None else '', r['ruptura_prevista'], f"{r['qtd_sugerida']:.0f}", r['obs']])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'07_sugestao_compra_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/replenishment.html', {
                    'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                    'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                    'base_days': base_days_r, 'lead_time': lead_time, 'safety': safety,
                    'rows': suggestions[:1000],
                })
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 10mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; } table { width: 100%; border-collapse: collapse; } th, td { padding: 5px; border-bottom: 1px solid #e8ecf3; text-align: left; } th { background: #f0f3f8; }')
                files.append((f'07_sugestao_compra_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 8) Fluxo de Caixa (real)
            tz = timezone.get_current_timezone()
            start_dt = timezone.make_aware(datetime.combine(s, time.min), tz) if s else None
            end_dt = timezone.make_aware(datetime.combine(e, time.max), tz) if e else None
            empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
            lanc = LancamentoFinanceiro.objects.all()
            if empresa:
                lanc = lanc.filter(empresa_id=empresa)
            if start_dt:
                lanc = lanc.filter(data_lancamento__gte=start_dt)
            if end_dt:
                lanc = lanc.filter(data_lancamento__lte=end_dt)

            total_entradas = lanc.filter(tipo='entrada').aggregate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['total'] or 0
            total_saidas = lanc.filter(tipo='saida').aggregate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['total'] or 0
            saldo = float(total_entradas) - float(total_saidas)

            entradas_por_dia = (
                lanc.filter(tipo='entrada')
                    .annotate(day=TruncDate('data_lancamento'))
                    .values('day')
                    .annotate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))
                    .order_by('day')
            )
            saidas_por_dia = (
                lanc.filter(tipo='saida')
                    .annotate(day=TruncDate('data_lancamento'))
                    .values('day')
                    .annotate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))
                    .order_by('day')
            )
            chart_start = s
            chart_end = e
            ent_map = {r['day']: float(r['total'] or 0) for r in entradas_por_dia}
            sai_map = {r['day']: float(r['total'] or 0) for r in saidas_por_dia}
            days = []
            ent_series, sai_series, saldo_series = [], [], []
            running = 0.0
            d = chart_start
            while d <= chart_end:
                e_val = ent_map.get(d, 0.0)
                s_val = sai_map.get(d, 0.0)
                running += e_val - s_val
                days.append(d)
                ent_series.append(e_val)
                sai_series.append(s_val)
                saldo_series.append(running)
                d += timedelta(days=1)
            context_cf = {
                'periodo_inicio': s.strftime('%d/%m/%Y'),
                'periodo_fim': e.strftime('%d/%m/%Y'),
                'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                'totais': {'entradas': total_entradas, 'saidas': total_saidas, 'saldo': saldo},
                'entradas_series': list(entradas_por_dia),
                'saidas_series': list(saidas_por_dia),
                'saldo_svg': mark_safe(svg_line_chart(saldo_series)),
                'entradas_svg': mark_safe(svg_bar_chart(ent_series)),
                'saidas_svg': mark_safe(svg_bar_chart(sai_series)),
                'por_categoria': list(
                    lanc.values('categoria', 'tipo')
                        .annotate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))
                        .order_by('categoria', 'tipo')
                ),
                'lancamentos': lanc.order_by('-data_lancamento')[:500],
            }
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Dia', 'Entradas', 'Saídas', 'Saldo Acumulado'])
                for idx, day in enumerate(days):
                    w.writerow([day.strftime('%d/%m/%Y'), f"{ent_series[idx]:.2f}", f"{sai_series[idx]:.2f}", f"{saldo_series[idx]:.2f}"])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'08_fluxo_caixa_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                html = render_to_string('reports/cashflow.html', context_cf)
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }')
                files.append((f'08_fluxo_caixa_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 9) Kardex (Parcial - real)
            vendas_k = Venda.objects.select_related('produto').all()
            if empresa:
                vendas_k = vendas_k.filter(produto__empresa_id=empresa)
            if start_dt:
                vendas_k = vendas_k.filter(data_venda__gte=start_dt)
            if end_dt:
                vendas_k = vendas_k.filter(data_venda__lte=end_dt)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vendas_k = vendas_k.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vendas_k = vendas_k.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vendas_k = vendas_k.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
            movimentos = []
            for v in vendas_k.order_by('data_venda')[:2000]:
                movimentos.append({
                    'data': v.data_venda,
                    'tipo': 'saida',
                    'documento': v.id_venda,
                    'produto': v.produto.nome,
                    'qtd': -int(v.quantidade or 0),
                    'saldo_aprox': None,
                    'obs': 'Parcial (somente saídas)'
                })
            entradas_total = 0
            saidas_total = sum(-m['qtd'] for m in movimentos)
            saldo_inicial = None
            saldo_final = None
            html = render_to_string('reports/kardex.html', {
                'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                'movimentos': movimentos,
                'sumario': {
                    'entradas': entradas_total,
                    'saidas': saidas_total,
                    'saldo_inicial': saldo_inicial,
                    'saldo_final': saldo_final,
                }
            })
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Data', 'Tipo', 'Documento', 'Produto', 'Quantidade', 'Saldo Aproximado', 'Obs'])
                for m in movimentos:
                    w.writerow([m['data'].strftime('%d/%m/%Y %H:%M') if m['data'] else '', m['tipo'], m['documento'], m['produto'], m['qtd'], m['saldo_aprox'] if m['saldo_aprox'] is not None else '', m['obs']])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'09_kardex_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 10mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; } table { width: 100%; border-collapse: collapse; } th, td { padding: 5px; border-bottom: 1px solid #e8ecf3; text-align: left; } th { background: #f0f3f8; }')
                files.append((f'09_kardex_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

            # 10) DRE Simplificada (real)
            vendas_d = Venda.objects.select_related('produto').all()
            if empresa:
                vendas_d = vendas_d.filter(produto__empresa_id=empresa)
            if start_dt:
                vendas_d = vendas_d.filter(data_venda__gte=start_dt)
            if end_dt:
                vendas_d = vendas_d.filter(data_venda__lte=end_dt)
            if vendedores_param:
                parts = [p.strip() for p in vendedores_param.split(',') if p.strip()]
                id_parts = [int(p) for p in parts if p.isdigit()]
                vendas_d = vendas_d.filter(Q(vendedor__email__in=parts) | Q(vendedor__id__in=id_parts))
            if cliente_param:
                vendas_d = vendas_d.filter(cliente_nome__icontains=cliente_param)
            if produto_param:
                vendas_d = vendas_d.filter(Q(produto__nome__icontains=produto_param) | Q(produto__id_produto=produto_param))
            receita_bruta = vendas_d.aggregate(t=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
            cmv_expr = ExpressionWrapper(
                F('quantidade') * Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
            cmv = vendas_d.aggregate(t=Coalesce(Sum(cmv_expr), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
            lucro_bruto = float(receita_bruta) - float(cmv)
            lanc_d = LancamentoFinanceiro.objects.all()
            if empresa:
                lanc_d = lanc_d.filter(empresa_id=empresa)
            if start_dt:
                lanc_d = lanc_d.filter(data_lancamento__gte=start_dt)
            if end_dt:
                lanc_d = lanc_d.filter(data_lancamento__lte=end_dt)
            despesas_op = lanc_d.filter(tipo='saida').aggregate(t=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
            outras_rec = lanc_d.filter(tipo='entrada', venda__isnull=True).aggregate(t=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
            receita_liquida = receita_bruta
            resultado_operacional = float(lucro_bruto) - float(despesas_op)
            resultado_liquido = resultado_operacional + float(outras_rec)
            html = render_to_string('reports/dre_simplificada.html', {
                'periodo_inicio': s.strftime('%d/%m/%Y'), 'periodo_fim': e.strftime('%d/%m/%Y'),
                'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
                'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
                'dre': {
                    'receita_bruta': receita_bruta,
                    'deducoes': 0,
                    'receita_liquida': receita_liquida,
                    'cmv': cmv,
                    'lucro_bruto': lucro_bruto,
                    'despesas_operacionais': despesas_op,
                    'resultado_operacional': resultado_operacional,
                    'outras_receitas': outras_rec,
                    'resultado_liquido': resultado_liquido,
                    'observacao': 'Parcial (estimado) por ausência de mapeamento completo de categorias.'
                }
            })
            if out_format == 'csv':
                sio = StringIO(newline='')
                w = csv.writer(sio, delimiter=';')
                w.writerow(['Conta', 'Valor'])
                w.writerow(['Receita Bruta', f"{float(receita_bruta):.2f}"])
                w.writerow(['(-) Deduções', f"{0.0:.2f}"])
                w.writerow(['= Receita Líquida', f"{float(receita_liquida):.2f}"])
                w.writerow(['(-) CMV', f"{float(cmv):.2f}"])
                w.writerow(['= Lucro Bruto', f"{float(lucro_bruto):.2f}"])
                w.writerow(['(-) Despesas Operacionais', f"{float(despesas_op):.2f}"])
                w.writerow(['= Resultado Operacional', f"{float(resultado_operacional):.2f}"])
                w.writerow(['(+/-) Outras Receitas', f"{float(outras_rec):.2f}"])
                w.writerow(['= Resultado Líquido', f"{float(resultado_liquido):.2f}"])
                data = sio.getvalue().encode('utf-8-sig')
                files.append((f'10_dre_simplificada_{s.isoformat()}_{e.isoformat()}.csv', data))
            else:
                pdf = render_pdf_bytes(html, '@page { size: A4; margin: 12mm; } body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; } table { width: 100%; border-collapse: collapse; } th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; } th { background: #f0f3f8; }')
                files.append((f'10_dre_simplificada_{s.isoformat()}_{e.isoformat()}.pdf', pdf))

        except Exception as e:
            files.append(("erro.txt", str(e).encode('utf-8')))

        mem = BytesIO()
        with zipfile.ZipFile(mem, mode='w', compression=zipfile.ZIP_DEFLATED) as zf:
            for fname, content in files:
                zf.writestr(fname, content)
        mem.seek(0)
        suffix = 'csv' if out_format == 'csv' else 'pdf'
        filename = f"relatorios_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}_{suffix}.zip"
        resp = HttpResponse(mem.read(), content_type='application/zip')
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp


# Placeholder endpoints for remaining reports (to be implemented)
class SellerPerformancePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        vendedores = request.GET.get('vendedor')  # csv of emails or ids

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        vendas = Venda.objects.select_related('vendedor', 'produto').all()
        if empresa:
            vendas = vendas.filter(produto__empresa_id=empresa)
        if start_dt:
            vendas = vendas.filter(data_venda__gte=start_dt)
        if end_dt:
            vendas = vendas.filter(data_venda__lte=end_dt)
        if vendedores:
            parts = [p.strip() for p in vendedores.split(',') if p.strip()]
            vendas = vendas.filter(
                Q(vendedor__email__in=parts) | Q(vendedor__id__in=[int(p) for p in parts if p.isdigit()])
            )

        receita_total_periodo = vendas.aggregate(t=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
        lucro_expr = ExpressionWrapper(
            F('quantidade') * (F('produto__preco_venda') - Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2))),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        by_seller = (
            vendas
            .values('vendedor__first_name', 'vendedor__email')
            .annotate(
                vendas_count=Count('id_venda'),
                faturamento=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                margem=Coalesce(Sum(lucro_expr), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
            )
            .order_by('-faturamento')
        )

        days_span = ((end - start).days + 1) if (start and end) else max(1, len({v['day'] for v in vendas.annotate(day=TruncDate('data_venda')).values('day')}))
        perf_rows = []
        seller_bars = []
        for r in by_seller:
            faturamento = float(r['faturamento'] or 0)
            vendas_count = int(r['vendas_count'] or 0)
            ticket_medio = (faturamento / vendas_count) if vendas_count else 0.0
            media_diaria = faturamento / days_span if days_span else 0.0
            nome = r.get('vendedor__first_name') or (r.get('vendedor__email') or 'N/A')
            part = (faturamento / float(receita_total_periodo) * 100.0) if float(receita_total_periodo) else 0.0
            perf_rows.append({
                'nome': nome,
                'vendas': vendas_count,
                'faturamento': faturamento,
                'ticket_medio': ticket_medio,
                'margem': float(r['margem'] or 0),
                'media_diaria': media_diaria,
                'participacao': part,
            })
            seller_bars.append(faturamento)

        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'rows': perf_rows,
            'bars_svg': mark_safe(svg_bar_chart(seller_bars)),
        }
        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Vendedor', 'Vendas', 'Faturamento', 'Ticket Médio', 'Margem', 'Média Diária', 'Participação %'])
            for r in perf_rows:
                w.writerow([
                    r['nome'], r['vendas'], f"{r['faturamento']:.2f}", f"{r['ticket_medio']:.2f}", f"{r['margem']:.2f}", f"{r['media_diaria']:.2f}", f"{r['participacao']:.2f}"
                ])
            csv_bytes = out.getvalue().encode('utf-8-sig')
            filename = f"performance_vendedor_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

        html_string = render_to_string('reports/seller_performance.html', context)
        base_css = '''
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }
            h3 { margin: 10px 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)
        filename = f"performance_vendedor_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class SalesByCustomerPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        cliente = request.GET.get('cliente')
        top_n = int(request.GET.get('top', '50') or 50)
        gap_days = int(request.GET.get('gap_days', '30') or 30)

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        vendas = Venda.objects.all()
        if empresa:
            vendas = vendas.filter(produto__empresa_id=empresa)
        if start_dt:
            vendas = vendas.filter(data_venda__gte=start_dt)
        if end_dt:
            vendas = vendas.filter(data_venda__lte=end_dt)
        if cliente:
            vendas = vendas.filter(cliente_nome__icontains=cliente)

        # RFM simplificado
        by_client = (
            vendas.values('cliente_nome')
            .annotate(
                compras=Count('id_venda'),
                faturamento=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
                ultima_compra=Max('data_venda')
            )
            .order_by('-faturamento')
        )
        today = timezone.now().date()
        rows = []
        top10 = []
        recuperaveis = []
        for idx, r in enumerate(by_client[:top_n]):
            nome = r['cliente_nome'] or '—'
            fatura = float(r['faturamento'] or 0)
            compras = int(r['compras'] or 0)
            ticket = (fatura / compras) if compras else 0.0
            last = r['ultima_compra'].date() if r['ultima_compra'] else None
            recencia = (today - last).days if last else None
            obs = 'VIP' if idx < 10 else ('engajar' if (recencia and recencia >= gap_days) else '')
            row = {
                'cliente': nome,
                'ultima_compra': last.strftime('%d/%m/%Y') if last else '—',
                'compras': compras,
                'faturamento': fatura,
                'ticket_medio': ticket,
                'observacoes': obs,
            }
            rows.append(row)
            if idx < 10:
                top10.append(row)
            if recencia and recencia >= gap_days:
                recuperaveis.append(row)

        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'rows': rows,
            'top10': top10,
            'recuperaveis': recuperaveis,
        }
        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            output = StringIO(newline='')
            writer = csv.writer(output, delimiter=';')
            writer.writerow(['Cliente', 'Última Compra', 'Compras', 'Faturamento', 'Ticket Médio', 'Observações'])
            for r in rows:
                writer.writerow([
                    r['cliente'], r['ultima_compra'], r['compras'], f"{r['faturamento']:.2f}", f"{r['ticket_medio']:.2f}", r['observacoes']
                ])
            csv_bytes = output.getvalue().encode('utf-8-sig')
            filename = f"vendas_cliente_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp
        else:
            html_string = render_to_string('reports/sales_by_customer.html', context)
            base_css = '''
                @page { size: A4 portrait; margin: 12mm; }
                body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }
                h3 { margin: 10px 0 6px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; }
                th { background: #f0f3f8; }
            '''
            pdf_bytes = render_pdf_bytes(html_string, base_css)
            filename = f"vendas_cliente_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response


class StockPositionPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        base_days = int(request.GET.get('base_days', '30') or 30)
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else timezone.now() - timedelta(days=base_days)
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else timezone.now()

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        produtos = Produto.objects.all()
        if empresa:
            produtos = produtos.filter(empresa_id=empresa)
        produtos = produtos.filter(ativo=True)

        # Média diária de vendas no período base por produto
        vendas = Venda.objects.select_related('produto').filter(data_venda__gte=start_dt, data_venda__lte=end_dt)
        if empresa:
            vendas = vendas.filter(produto__empresa_id=empresa)
        by_prod = (
            vendas
            .values('produto__id_produto')
            .annotate(qtd=Coalesce(Sum('quantidade'), Value(0)))
            .values('produto__id_produto', 'qtd')
        )
        qtd_map = {r['produto__id_produto']: int(r['qtd'] or 0) for r in by_prod}
        days = max(1, (end_dt.date() - start_dt.date()).days or base_days)

        rows = []
        valor_total_custo = 0.0
        baixo_estoque = 0
        sem_giro = 0
        for p in produtos:
            avg = (qtd_map.get(p.id_produto, 0) / days) if days else 0.0
            custo = float(p.preco_custo or 0)
            valor_estoque = float(p.quantidade_estoque) * custo
            valor_total_custo += valor_estoque
            margem_pct = ((float(p.preco_venda) - custo) / float(p.preco_venda) * 100.0) if float(p.preco_venda or 0) else 0.0
            cobertura = (float(p.quantidade_estoque) / avg) if avg else None
            status = 'baixo' if p.quantidade_estoque <= (p.quantidade_minima_estoque or 0) else ('excesso' if (cobertura and cobertura > 90) else 'ok')
            if status == 'baixo':
                baixo_estoque += 1
            if (qtd_map.get(p.id_produto, 0) or 0) == 0:
                sem_giro += 1
            rows.append({
                'codigo': p.codigo_do_produto or p.id_produto,
                'nome': p.nome,
                'estoque': p.quantidade_estoque,
                'estoque_min': p.quantidade_minima_estoque,
                'custo_medio': custo,
                'valor_estoque': valor_estoque,
                'preco_venda': float(p.preco_venda or 0),
                'margem_pct': margem_pct,
                'cobertura': cobertura,
                'status': status,
            })

        context = {
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'valor_total_custo': valor_total_custo,
            'baixo_estoque': baixo_estoque,
            'sem_giro': sem_giro,
            'rows': rows[:1000],
        }
        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Código', 'Nome', 'Estoque', 'Estoque Mínimo', 'Custo Médio', 'Valor Estoque', 'Preço Venda', 'Margem %', 'Cobertura (dias)', 'Status'])
            for r in rows:
                w.writerow([
                    r['codigo'], r['nome'], r['estoque'], r['estoque_min'], f"{r['custo_medio']:.2f}", f"{r['valor_estoque']:.2f}", f"{r['preco_venda']:.2f}", f"{r['margem_pct']:.2f}", (f"{r['cobertura']:.2f}" if r['cobertura'] is not None else ''), r['status']
                ])
            csv_bytes = out.getvalue().encode('utf-8-sig')
            filename = f"posicao_estoque_{timezone.now().date().isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

        html_string = render_to_string('reports/stock_position.html', context)
        base_css = '''
            @page { size: A4; margin: 10mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 5px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)
        filename = f"posicao_estoque_{timezone.now().date().isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class ReplenishmentSuggestionPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        base_days = int(request.GET.get('base_days', '30') or 30)
        lead_time = int(request.GET.get('lead_time', '7') or 7)
        safety = int(request.GET.get('safety', '3') or 3)

        tz = timezone.get_current_timezone()
        end_dt = timezone.now()
        start_dt = end_dt - timedelta(days=base_days)

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        produtos = Produto.objects.all()
        if empresa:
            produtos = produtos.filter(empresa_id=empresa)
        produtos = produtos.filter(ativo=True)

        vendas = Venda.objects.select_related('produto').filter(data_venda__gte=start_dt, data_venda__lte=end_dt)
        if empresa:
            vendas = vendas.filter(produto__empresa_id=empresa)
        by_prod = (
            vendas
            .values('produto__id_produto')
            .annotate(qtd=Coalesce(Sum('quantidade'), Value(0)))
            .values('produto__id_produto', 'qtd')
        )
        qtd_map = {r['produto__id_produto']: int(r['qtd'] or 0) for r in by_prod}
        days = max(1, base_days)

        suggestions = []
        today = timezone.now().date()
        for p in produtos:
            avg = (qtd_map.get(p.id_produto, 0) / days) if days else 0.0
            cobertura = (float(p.quantidade_estoque) / avg) if avg else None
            ruptura_prevista = (today + timedelta(days=int(cobertura))) if cobertura else None
            qtd_sugerida = max(0.0, (lead_time + safety) * avg - float(p.quantidade_estoque))
            obs = ''
            if cobertura is None:
                obs = 'Sem giro'
            elif cobertura <= lead_time + safety:
                obs = 'Alta prioridade'
            suggestions.append({
                'produto': p.nome,
                'media_diaria': avg,
                'estoque_atual': p.quantidade_estoque,
                'cobertura': cobertura,
                'ruptura_prevista': ruptura_prevista.strftime('%d/%m/%Y') if ruptura_prevista else '—',
                'qtd_sugerida': qtd_sugerida,
                'obs': obs,
            })

        # Ordena por menor cobertura primeiro (maior risco)
        suggestions.sort(key=lambda x: (x['cobertura'] if x['cobertura'] is not None else 1e9))

        context = {
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'base_days': base_days, 'lead_time': lead_time, 'safety': safety,
            'rows': suggestions[:1000],
        }
        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            output = StringIO(newline='')
            writer = csv.writer(output, delimiter=';')
            writer.writerow(['Produto', 'Média Diária', 'Estoque Atual', 'Cobertura (dias)', 'Ruptura Prevista', 'Qtd. Sugerida', 'Observações'])
            for r in suggestions:
                writer.writerow([
                    r['produto'], f"{r['media_diaria']:.2f}", r['estoque_atual'],
                    f"{r['cobertura']:.2f}" if r['cobertura'] is not None else '',
                    r['ruptura_prevista'], f"{r['qtd_sugerida']:.0f}", r['obs']
                ])
            csv_bytes = output.getvalue().encode('utf-8-sig')
            filename = f"sugestao_compra_{timezone.now().date().isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp
        else:
            html_string = render_to_string('reports/replenishment.html', context)
            base_css = '''
                @page { size: A4 portrait; margin: 10mm; }
                body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 5px; border-bottom: 1px solid #e8ecf3; text-align: left; }
                th { background: #f0f3f8; }
            '''
            pdf_bytes = render_pdf_bytes(html_string, base_css)
            filename = f"sugestao_compra_{timezone.now().date().isoformat()}.pdf"
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response


class CashflowPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))

        if start and end and start > end:
            return HttpResponseBadRequest('Parâmetros de data inválidos: start > end')

        tz = timezone.get_current_timezone()
        start_dt = timezone.make_aware(datetime.combine(start, time.min), tz) if start else None
        end_dt = timezone.make_aware(datetime.combine(end, time.max), tz) if end else None

        empresa = getattr(getattr(request.user, 'empresa', None), 'id', None)
        lanc = LancamentoFinanceiro.objects.all()
        if empresa:
            lanc = lanc.filter(empresa_id=empresa)
        if start_dt:
            lanc = lanc.filter(data_lancamento__gte=start_dt)
        if end_dt:
            lanc = lanc.filter(data_lancamento__lte=end_dt)

        total_entradas = lanc.filter(tipo='entrada').aggregate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['total'] or 0
        total_saidas = lanc.filter(tipo='saida').aggregate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['total'] or 0
        saldo = float(total_entradas) - float(total_saidas)

        entradas_por_dia = (
            lanc.filter(tipo='entrada')
                .annotate(day=TruncDate('data_lancamento'))
                .values('day')
                .annotate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))
                .order_by('day')
        )
        saidas_por_dia = (
            lanc.filter(tipo='saida')
                .annotate(day=TruncDate('data_lancamento'))
                .values('day')
                .annotate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))
                .order_by('day')
        )

        chart_start = start or (timezone.now().date() - timedelta(days=29))
        chart_end = end or timezone.now().date()

        ent_map = {r['day']: float(r['total'] or 0) for r in entradas_por_dia}
        sai_map = {r['day']: float(r['total'] or 0) for r in saidas_por_dia}
        days = []
        ent_series = []
        sai_series = []
        saldo_series = []
        running = 0.0
        d = chart_start
        while d <= chart_end:
            e_val = ent_map.get(d, 0.0)
            s_val = sai_map.get(d, 0.0)
            running += e_val - s_val
            days.append(d)
            ent_series.append(e_val)
            sai_series.append(s_val)
            saldo_series.append(running)
            d += timedelta(days=1)

        por_categoria = (
            lanc.values('categoria', 'tipo')
                .annotate(total=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))
                .order_by('categoria', 'tipo')
        )

        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(["Período", start.strftime('%d/%m/%Y') if start else '-', end.strftime('%d/%m/%Y') if end else '-'])
            w.writerow(['Entradas Totais', f"{float(total_entradas):.2f}"])
            w.writerow(['Saídas Totais', f"{float(total_saidas):.2f}"])
            w.writerow(['Saldo', f"{saldo:.2f}"])
            w.writerow([])
            w.writerow(['Dia', 'Entradas', 'Saídas', 'Saldo Acumulado'])
            for idx, day in enumerate(days):
                w.writerow([
                    day.strftime('%d/%m/%Y'), f"{ent_series[idx]:.2f}", f"{sai_series[idx]:.2f}", f"{saldo_series[idx]:.2f}"
                ])
            csv_bytes = out.getvalue().encode('utf-8-sig')
            filename = f"fluxo_caixa_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'totais': {
                'entradas': total_entradas,
                'saidas': total_saidas,
                'saldo': saldo,
            },
            'saldo_svg': mark_safe(svg_line_chart(saldo_series)),
            'entradas_svg': mark_safe(svg_bar_chart(ent_series)),
            'saidas_svg': mark_safe(svg_bar_chart(sai_series)),
            'por_categoria': list(por_categoria),
            'lancamentos': lanc.order_by('-data_lancamento')[:500],
        }
        html_string = render_to_string('reports/cashflow.html', context)
        base_css = '''
            @page { size: A4 portrait; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }
            h3 { margin: 10px 0 6px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)
        filename = f"fluxo_caixa_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class KardexPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
        produto = request.GET.get('produto')

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
        if produto:
            vendas = vendas.filter(Q(produto__nome__icontains=produto) | Q(produto__id_produto=produto))

        # Como não temos entradas/ajustes, este Kardex é parcial (somente saídas/vendas)
        movimentos = []
        for v in vendas.order_by('data_venda')[:2000]:
            movimentos.append({
                'data': v.data_venda,
                'tipo': 'saida',
                'documento': v.id_venda,
                'produto': v.produto.nome,
                'qtd': -int(v.quantidade or 0),
                'saldo_aprox': None,  # não calculado sem entradas/ajustes
                'obs': 'Parcial (somente saídas)'
            })

        # Sumário parcial
        entradas_total = 0
        saidas_total = sum(-m['qtd'] for m in movimentos)
        saldo_inicial = None
        saldo_final = None

        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'movimentos': movimentos,
            'sumario': {
                'entradas': entradas_total,
                'saidas': saidas_total,
                'saldo_inicial': saldo_inicial,
                'saldo_final': saldo_final,
            }
        }
        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Data', 'Tipo', 'Documento', 'Produto', 'Quantidade', 'Saldo Aproximado', 'Obs'])
            for m in movimentos:
                w.writerow([
                    m['data'].strftime('%d/%m/%Y %H:%M') if m['data'] else '',
                    m['tipo'], m['documento'], m['produto'], m['qtd'], m['saldo_aprox'] if m['saldo_aprox'] is not None else '', m['obs']
                ])
            csv_bytes = out.getvalue().encode('utf-8-sig')
            filename = f"kardex_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"
            resp = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{filename}"'
            return resp

        html_string = render_to_string('reports/kardex.html', context)
        base_css = '''
            @page { size: A4; margin: 10mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 5px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)
        filename = f"kardex_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class DresimplificadaPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start = parse_date(request.GET.get('start'))
        end = parse_date(request.GET.get('end'))
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
        receita_bruta = vendas.aggregate(t=Coalesce(Sum('preco_total'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0

        cmv_expr = ExpressionWrapper(
            F('quantidade') * Coalesce(F('produto__preco_custo'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)),
            output_field=DecimalField(max_digits=12, decimal_places=2)
        )
        cmv = vendas.aggregate(t=Coalesce(Sum(cmv_expr), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
        lucro_bruto = float(receita_bruta) - float(cmv)

        lanc = LancamentoFinanceiro.objects.all()
        if empresa:
            lanc = lanc.filter(empresa_id=empresa)
        if start_dt:
            lanc = lanc.filter(data_lancamento__gte=start_dt)
        if end_dt:
            lanc = lanc.filter(data_lancamento__lte=end_dt)

        # Estimado: despesas operacionais = saídas, outras receitas = entradas sem vínculo a venda
        despesas_op = lanc.filter(tipo='saida').aggregate(t=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0
        outras_rec = lanc.filter(tipo='entrada', venda__isnull=True).aggregate(t=Coalesce(Sum('valor'), Value(0), output_field=DecimalField(max_digits=12, decimal_places=2)))['t'] or 0

        receita_liquida = receita_bruta  # sem deduções configuradas
        resultado_operacional = float(lucro_bruto) - float(despesas_op)
        resultado_liquido = resultado_operacional + float(outras_rec)

        # CSV or PDF
        if request.GET.get('format', 'pdf').lower() == 'csv':
            out = StringIO(newline='')
            w = csv.writer(out, delimiter=';')
            w.writerow(['Período', start.strftime('%d/%m/%Y') if start else '-', end.strftime('%d/%m/%Y') if end else '-'])
            w.writerow(['Emitido em', timezone.now().strftime('%d/%m/%Y %H:%M')])
            w.writerow([])
            w.writerow(['Conta', 'Valor'])
            w.writerow(['Receita Bruta', f"{float(receita_bruta):.2f}"])
            w.writerow(['(-) Deduções', f"{0:.2f}"])
            w.writerow(['= Receita Líquida', f"{float(receita_liquida):.2f}"])
            w.writerow(['(-) CMV', f"{float(cmv):.2f}"])
            w.writerow(['= Lucro Bruto', f"{float(lucro_bruto):.2f}"])
            w.writerow(['(-) Despesas Operacionais', f"{float(despesas_op):.2f}"])
            w.writerow(['= Resultado Operacional', f"{float(resultado_operacional):.2f}"])
            w.writerow(['(+/-) Outras Receitas', f"{float(outras_rec):.2f}"])
            w.writerow(['= Resultado Líquido', f"{float(resultado_liquido):.2f}"])
            data = out.getvalue().encode('utf-8-sig')
            resp = HttpResponse(data, content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="dre_simplificada_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.csv"'
            return resp

        context = {
            'periodo_inicio': start.strftime('%d/%m/%Y') if start else '-',
            'periodo_fim': end.strftime('%d/%m/%Y') if end else '-',
            'emitido_em': timezone.now().strftime('%d/%m/%Y %H:%M'),
            'empresa_nome': getattr(getattr(request.user, 'empresa', None), 'nome_fantasia', '—'),
            'dre': {
                'receita_bruta': receita_bruta,
                'deducoes': 0,
                'receita_liquida': receita_liquida,
                'cmv': cmv,
                'lucro_bruto': lucro_bruto,
                'despesas_operacionais': despesas_op,
                'resultado_operacional': resultado_operacional,
                'outras_receitas': outras_rec,
                'resultado_liquido': resultado_liquido,
                'observacao': 'Parcial (estimado) por ausência de mapeamento completo de categorias.'
            }
        }
        html_string = render_to_string('reports/dre_simplificada.html', context)
        base_css = '''
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px; border-bottom: 1px solid #e8ecf3; text-align: left; }
            th { background: #f0f3f8; }
        '''
        pdf_bytes = render_pdf_bytes(html_string, base_css)
        filename = f"dre_simplificada_{(start or timezone.now().date()).isoformat()}_{(end or timezone.now().date()).isoformat()}.pdf"
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
