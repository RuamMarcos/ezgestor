from rest_framework import serializers
from .models import Produto

class QuickAddSerializer(serializers.Serializer):
    """Serializer para a string de entrada rápida."""
    quick_add_string = serializers.CharField(max_length=100)

class AddStockSerializer(serializers.Serializer):
    """Serializer para adicionar estoque."""
    quantity = serializers.IntegerField(min_value=1)

class ProdutoSerializer(serializers.ModelSerializer):
    em_baixo_estoque = serializers.BooleanField(read_only=True)
    imagem_url = serializers.SerializerMethodField(read_only=True)
    ativo = serializers.BooleanField(read_only=True)
    imagem_url = serializers.SerializerMethodField(read_only=True)

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
            'em_baixo_estoque',
            'imagem',
            'imagem_url',
            'ativo',
        ]
        extra_kwargs = {
            'imagem': {'required': False, 'allow_null': True}
        }

    def validate(self, data):
        empresa = self.context['request'].user.empresa
        codigo = data.get('codigo_do_produto')
        instance = getattr(self, 'instance', None)
        
        if codigo:
            queryset = Produto.objects.filter(empresa=empresa, codigo_do_produto=codigo)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({"codigo_do_produto": "Este código já está em uso para esta empresa."})
        
        return data

    def get_imagem_url(self, obj: Produto):
        request = self.context.get('request')
        if obj.imagem and hasattr(obj.imagem, 'url'):
            url = obj.imagem.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None