from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Empresa, Usuario, Plano

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Adicionar campos customizados ao token
        token['first_name'] = user.first_name
        token['email'] = user.email
        return token

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para visualização de dados de usuário."""
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'nivel_acesso']

class EmpresaRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para o registo de uma nova empresa e do seu administrador."""
    admin_email = serializers.EmailField(write_only=True)
    admin_first_name = serializers.CharField(write_only=True)
    admin_last_name = serializers.CharField(write_only=True)
    admin_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Empresa
        fields = ['id', 'nome_fantasia', 'razao_social', 'cnpj', 'admin_email', 'admin_first_name', 'admin_last_name', 'admin_password']

    def create(self, validated_data):
        empresa = Empresa.objects.create(
            nome_fantasia=validated_data['nome_fantasia'],
            razao_social=validated_data['razao_social'],
            cnpj=validated_data['cnpj']
        )
        Usuario.objects.create_user(
            email=validated_data['admin_email'],
            first_name=validated_data['admin_first_name'],
            last_name=validated_data['admin_last_name'],
            password=validated_data['admin_password'],
            empresa=empresa,
            nivel_acesso='administrador',
            is_staff=True
        )
        return empresa

class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer para criar novos membros da equipa."""
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'nivel_acesso', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer para ver e editar o perfil do usuário logado."""
    nome_fantasia_empresa = serializers.CharField(source='empresa.nome_fantasia', read_only=True)
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'nome_fantasia_empresa']
        read_only_fields = ['email', 'id', 'nome_fantasia_empresa']

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer para a troca de senha.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

class ProcessarPagamentoSerializer(serializers.Serializer):
    """
    Serializer para processar a criação de uma assinatura e o primeiro pagamento.
    """
    plano_id = serializers.IntegerField(required=True)
    metodo = serializers.ChoiceField(choices=['cartao', 'pix', 'boleto'], required=True)

    def validate_plano_id(self, value):
        if not Plano.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Plano não encontrado.")
        return value