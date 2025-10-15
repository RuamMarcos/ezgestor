from rest_framework import serializers
from .models import LancamentoFinanceiro

class LancamentoFinanceiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = LancamentoFinanceiro
        fields = [
            'id_lancamento',
            'venda',
            'descricao',
            'valor',
            'tipo',
            'data_lancamento',
            'categoria'
        ]