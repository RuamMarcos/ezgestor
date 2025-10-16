from django.urls import path
from .views import (
    ExecutiveSummaryPDFView,
    SalesPeriodPDFView,
    ProductRankingPDFView,
    ReportsBundleZipView,
    SellerPerformancePDFView,
    SalesByCustomerPDFView,
    StockPositionPDFView,
    ReplenishmentSuggestionPDFView,
    CashflowPDFView,
    KardexPDFView,
    DresimplificadaPDFView,
)

urlpatterns = [
    path('executive-summary/', ExecutiveSummaryPDFView.as_view(), name='report-executive-summary'),
    path('sales-period/', SalesPeriodPDFView.as_view(), name='report-sales-period'),
    path('product-ranking/', ProductRankingPDFView.as_view(), name='report-product-ranking'),
    path('bundle/', ReportsBundleZipView.as_view(), name='report-bundle-zip'),
    path('seller-performance/', SellerPerformancePDFView.as_view(), name='report-seller-performance'),
    path('sales-by-customer/', SalesByCustomerPDFView.as_view(), name='report-sales-by-customer'),
    # Aliases in PT-BR for convenience
    path('vendas-por-clientes/', SalesByCustomerPDFView.as_view(), name='report-sales-by-customer-pt'),
    path('stock-position/', StockPositionPDFView.as_view(), name='report-stock-position'),
    path('replenishment-suggestion/', ReplenishmentSuggestionPDFView.as_view(), name='report-replenishment-suggestion'),
    path('sugestao-de-compra/', ReplenishmentSuggestionPDFView.as_view(), name='report-replenishment-suggestion-pt'),
    path('cashflow/', CashflowPDFView.as_view(), name='report-cashflow'),
    path('fluxo-de-caixa/', CashflowPDFView.as_view(), name='report-cashflow-pt'),
    path('kardex/', KardexPDFView.as_view(), name='report-kardex'),
    path('dre-simplificada/', DresimplificadaPDFView.as_view(), name='report-dre-simplificada'),
]
