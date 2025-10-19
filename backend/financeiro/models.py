from django.db import models
from accounts.models import Empresa
from vendas.models import Venda

class LancamentoFinanceiro(models.Model):
    id_lancamento = models.AutoField(primary_key=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='lancamentos')
    venda = models.ForeignKey(Venda, on_delete=models.SET_NULL, null=True, blank=True, related_name='lancamentos')
    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]
    tipo = models.CharField(max_length=7, choices=TIPO_CHOICES)
    data_lancamento = models.DateTimeField(auto_now_add=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.descricao} - R$ {self.valor}"

    class Meta:
        ordering = ['-data_lancamento']