from django.contrib import admin
from .models import (
    Empresa, Usuario, Plano, Assinatura, Pagamento
)

admin.site.register(Empresa)
admin.site.register(Usuario)
admin.site.register(Plano)
admin.site.register(Assinatura)
admin.site.register(Pagamento)