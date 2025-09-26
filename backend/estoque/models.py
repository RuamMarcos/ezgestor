from django.db import models
from accounts.models import Empresa

class Produto(models.Model):
    id_produto = models.AutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='produtos')
    codigo_do_produto = models.CharField(max_length=255, blank=True, null=True)
    nome = models.CharField(max_length=255)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quantidade_estoque = models.IntegerField()
    quantidade_minima_estoque = models.IntegerField(default=0, help_text="Quantidade mínima para alerta de baixo estoque.")
    
    def __str__(self):
        return self.nome

    @property
    def em_baixo_estoque(self):
        return self.quantidade_estoque <= self.quantidade_minima_estoque