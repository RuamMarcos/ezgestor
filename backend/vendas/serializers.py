from rest_framework import serializers
from .models import Venda

class VendaSerializer(serializers.ModelSerializer):
    # Campos adicionais para mostrar nomes em vez de IDs
    nome_produto = serializers.CharField(source='produto.nome', read_only=True)
    nome_vendedor = serializers.SerializerMethodField()

    class Meta:
        model = Venda
        fields = [
            'id_venda', 
            'nome_produto', 
            'nome_vendedor', 
            'quantidade', 
            'preco_total', 
            'data_venda'
        ]

    def get_nome_vendedor(self, obj):
        """
        Retorna o nome completo do vendedor (primeiro e último nome).
        Se o vendedor for nulo, retorna um valor padrão.
        """
        if obj.vendedor:
            # Garante que não haja espaços extras se um dos nomes estiver faltando
            return f"{obj.vendedor.first_name or ''} {obj.vendedor.last_name or ''}".strip()
        return "Vendedor não informado"