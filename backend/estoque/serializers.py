from rest_framework import serializers
from .models import Produto

class ProdutoSerializer(serializers.ModelSerializer):
    em_baixo_estoque = serializers.BooleanField(read_only=True)

    class Meta:
        model = Produto
        fields = [
            'id_produto',
            'codigo_do_produto',
            'nome',
            'preco_venda',
            'preco_custo',
            'quantidade_estoque',
            'quantidade_minima_estoque',
            'em_baixo_estoque'
        ]