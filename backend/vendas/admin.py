from django.contrib import admin
from .models import Venda

@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    save_as = True
    list_display = ('id_venda', 'produto', 'quantidade', 'preco_total', 'vendedor', 'data_venda')
    search_fields = ('produto__nome', 'vendedor__username')
    list_filter = ('data_venda', 'vendedor')
    ordering = ('-data_venda',)

    def get_queryset(self, request):
        """Filtra as vendas para mostrar apenas as da empresa do usuário."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(produto__empresa=request.user.empresa)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filtra o dropdown de 'produto' para mostrar apenas os da empresa do usuário."""
        if db_field.name == "produto":
            if hasattr(request.user, 'empresa') and request.user.empresa:
                kwargs["queryset"] = db_field.related_model.objects.filter(
                    empresa=request.user.empresa
                )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        """Garante que o vendedor seja o usuário logado, se não for superuser."""
        if not request.user.is_superuser and not obj.vendedor:
            obj.vendedor = request.user
        super().save_model(request, obj, form, change)