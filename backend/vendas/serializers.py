from rest_framework import serializers
from .models import Venda

class VendaSerializer(serializers.ModelSerializer):
    # Campos adicionais para mostrar nomes em vez de IDs
    nome_produto = serializers.CharField(source='produto.nome', read_only=True)
    nome_vendedor = serializers.CharField(source='vendedor.username', read_only=True, default='Vendedor Anônimo')

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