from django.contrib import admin
from .models import (
    Empresa, Usuario
)    
#     , Plano, Assinatura, Produto,
#     Cliente, Venda, ItemVenda, LancamentoFinanceiro
# )

admin.site.register(Empresa)
admin.site.register(Usuario)
# admin.site.register(Plano)
# admin.site.register(Assinatura)
# admin.site.register(Produto)
# admin.site.register(Cliente)
# admin.site.register(Venda)
# admin.site.register(ItemVenda)
# admin.site.register(LancamentoFinanceiro)