from django.contrib import admin
from .models import (
    Empresa, Usuario, Plano, Assinatura
)       

admin.site.register(Empresa)
admin.site.register(Usuario)
admin.site.register(Plano)
admin.site.register(Assinatura)