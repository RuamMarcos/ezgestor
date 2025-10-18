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


    def create(self, validated_data):
        # Pega o usuário logado a partir do contexto (passado pela view)
        request = self.context.get('request')
        empresa_usuario = request.user.empresa
        
        # Adiciona a empresa aos dados validados antes de criar
        validated_data['empresa'] = empresa_usuario
        
        # Não permite que um lançamento manual seja associado a uma venda (venda=null)
        validated_data['venda'] = None
        
        return super().create(validated_data)

    def validate(self, data):
        # Garante que o campo 'venda' não seja definido manualmente
        # em um lançamento manual (vendas criam seus próprios lançamentos).
        # Se for uma atualização (self.instance), não mexemos.
        if not self.instance:
            if data.get('venda'):
                raise serializers.ValidationError("Não é possível associar manualmente um lançamento a uma venda por este endpoint.")
        return data