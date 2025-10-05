from django.db import models
from django.conf import settings
from estoque.models import Produto

class Venda(models.Model):
    id_venda = models.AutoField(primary_key=True)
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='vendas'
    )
    produto = models.ForeignKey(
        Produto, 
        on_delete=models.PROTECT,
        related_name='vendas'
    )
    quantidade = models.PositiveIntegerField(default=1)
    preco_total = models.DecimalField(max_digits=10, decimal_places=2)
    # Informações opcionais do cliente
    cliente_nome = models.CharField(max_length=255, blank=True, null=True)
    cliente_email = models.EmailField(blank=True, null=True)
    cliente_telefone = models.CharField(max_length=50, blank=True, null=True)
    data_venda = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        vendedor_str = self.vendedor.email if self.vendedor else 'N/A'
        return f"Venda de {self.produto.nome} por {vendedor_str}"

    class Meta:
        ordering = ['-data_venda']