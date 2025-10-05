from rest_framework import serializers
from django.db import transaction
from .models import Venda
from estoque.models import Produto

class VendaSerializer(serializers.ModelSerializer):
    nome_produto = serializers.CharField(source='produto.nome', read_only=True)
    nome_vendedor = serializers.SerializerMethodField()
    pago = serializers.SerializerMethodField()

    class Meta:
        model = Venda
        fields = [
            'id_venda', 
            'nome_produto', 
            'nome_vendedor', 
            'quantidade', 
            'preco_total', 
            'data_venda',
            'pago',
            'cliente_nome',
            'cliente_email',
            'cliente_telefone',
        ]

    def get_nome_vendedor(self, obj):
        if obj.vendedor and obj.vendedor.first_name:
            return obj.vendedor.first_name
        return "Vendedor não informado"

    def get_pago(self, obj):
        # Por decisão de design, toda venda listada é considerada paga
        return True


class VendaCreateSerializer(serializers.ModelSerializer):
    produto_id = serializers.IntegerField(write_only=True)
    nome_produto = serializers.CharField(source='produto.nome', read_only=True)
    preco_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    # Campos opcionais de cliente
    cliente_nome = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cliente_email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    cliente_telefone = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Venda
        fields = [
            'id_venda',
            'produto_id',
            'nome_produto',
            'quantidade',
            'preco_unitario',
            'preco_total',
            'data_venda',
            'cliente_nome',
            'cliente_email',
            'cliente_telefone',
        ]
        read_only_fields = ['id_venda', 'preco_total', 'data_venda']

    def validate(self, data):
        produto_id = data.get('produto_id')
        quantidade = data.get('quantidade')
        user = self.context['request'].user

        try:
            produto = Produto.objects.get(id_produto=produto_id, empresa=user.empresa)
        except Produto.DoesNotExist:
            raise serializers.ValidationError({"produto_id": "Produto não encontrado ou não pertence à sua empresa."})

        if produto.quantidade_estoque < quantidade:
            raise serializers.ValidationError({
                "quantidade": f"Estoque insuficiente. Disponível: {produto.quantidade_estoque} unidades."
            })

        data['produto'] = produto
        return data

    def create(self, validated_data):
        # Extract fields and clean non-model keys to avoid TypeError
        produto = validated_data.pop('produto')
        quantidade = validated_data.pop('quantidade')
        # Remove write-only helper field that doesn't exist on model
        validated_data.pop('produto_id', None)
        user = self.context['request'].user

        with transaction.atomic():
            # Reduz o estoque
            produto.quantidade_estoque -= quantidade
            produto.save()

            # Calcula o preço total
            preco_total = produto.preco_venda * quantidade

            # Cria a venda com campos explícitos apenas
            venda = Venda.objects.create(
                vendedor=user,
                produto=produto,
                quantidade=quantidade,
                preco_total=preco_total,
                # Campos opcionais de cliente (não obrigatórios)
                cliente_nome=validated_data.get('cliente_nome'),
                cliente_email=validated_data.get('cliente_email'),
                cliente_telefone=validated_data.get('cliente_telefone'),
            )

        return venda

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['preco_unitario'] = instance.produto.preco_venda
        return representation