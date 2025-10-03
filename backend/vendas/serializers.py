from rest_framework import serializers
from .models import Venda

class VendaSerializer(serializers.ModelSerializer):
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
        
        if obj.vendedor and obj.vendedor.first_name:
            return obj.vendedor.first_name
        return "Vendedor não informado"