from django.db import models
import uuid
import os
import uuid
import os
from accounts.models import Empresa

def produto_image_upload_to(instance, filename: str) -> str:
    # Preserve file extension and generate a uuid-based unique name
    base, ext = os.path.splitext(filename)
    ext = ext.lower() if ext else '.jpg'
    return os.path.join('produtos', f"{uuid.uuid4().hex}{ext}")


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

    class Meta:
        unique_together = ('empresa', 'codigo_do_produto')
        indexes = [
            models.Index(fields=['nome'], name='produto_nome_idx'),
            models.Index(fields=['codigo_do_produto'], name='produto_codigo_idx'),
            models.Index(fields=['empresa', 'codigo_do_produto'], name='empresa_codigo_comp_idx'),
        ]