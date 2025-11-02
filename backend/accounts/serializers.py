from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Empresa, Usuario, Plano, UserPreference, Assinatura, Pagamento

class EmpresaSerializer(serializers.ModelSerializer):
    """
    Serializer para visualizar e editar os dados da empresa.
    """
    logotipo = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)
    cnpj = serializers.CharField(max_length=18)

    class Meta:
        model = Empresa
        fields = [
            'id', 'nome_fantasia', 'razao_social', 'cnpj', 'logotipo', 
            'inscricao_estadual', 'endereco', 'cep', 'bairro', 'cidade', 
            'estado', 'pais', 'telefone', 'email_principal'
        ]
        read_only_fields = []

    def validate_cnpj(self, value):
        """Verifica se o CNPJ já está em uso por outra empresa"""
        # Durante update, exclui a própria instância da verificação
        if self.instance:
            queryset = Empresa.objects.exclude(pk=self.instance.pk)
        else:
            queryset = Empresa.objects.all()
        
        if queryset.filter(cnpj=value).exists():
            raise serializers.ValidationError("Este CNPJ já está cadastrado.")
        return value

    def update(self, instance, validated_data):
        instance.logotipo = validated_data.get('logotipo', instance.logotipo)
        return super().update(instance, validated_data)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Adicionar campos customizados ao token
        token['first_name'] = user.first_name
        token['email'] = user.email

        token['nivel_acesso'] = user.nivel_acesso

        # Adicionar status da assinatura ao token
        has_active_subscription = False
        if user.empresa:
            try:
                # Verifica se a empresa tem uma assinatura e se ela está ativa
                if user.empresa.assinatura and user.empresa.assinatura.status == 'ativa':
                    has_active_subscription = True
            except AttributeError:
                # Caso a empresa ainda não tenha uma assinatura, o atributo não existirá.
                # Apenas ignora e mantém has_active_subscription como False.
                pass
        
        token['has_active_subscription'] = has_active_subscription
        
        return token
    
class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para visualização de dados de usuário."""
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'nivel_acesso', 'is_active']    

class TeamMemberUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para atualizar um membro da equipe (Admin).
    Não permite alterar email ou senha por aqui.
    """
    class Meta:
        model = Usuario
        fields = ['first_name', 'last_name', 'nivel_acesso', 'is_active']
        read_only_fields = ['email'] 

class EmpresaRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para o registo de uma nova empresa e do seu administrador."""
    admin_email = serializers.EmailField(write_only=True)
    admin_first_name = serializers.CharField(write_only=True)
    admin_last_name = serializers.CharField(write_only=True)
    admin_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Empresa
        fields = ['id', 'nome_fantasia', 'razao_social', 'cnpj', 'admin_email', 'admin_first_name', 'admin_last_name', 'admin_password']

    def validate_cnpj(self, value):
        """Verifica se o CNPJ já está em uso."""
        if Empresa.objects.filter(cnpj=value).exists():
            raise serializers.ValidationError("Este CNPJ já está cadastrado.")
        return value

    def validate_admin_email(self, value):
        """Verifica se o e-mail do administrador já está em uso."""
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso por outro usuário.")
        return value

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
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {
                'error_messages': {
                    'unique': 'Este e-mail já está cadastrado no sistema.',
                    'invalid': 'Insira um endereço de e-mail válido.',
                    'required': 'O campo de e-mail é obrigatório.'
                }
            }
        }

    def validate_email(self, value):
        """Validação customizada para e-mail duplicado com mensagem em português."""
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado no sistema.")
        return value

    def create(self, validated_data):
        validated_data['is_active'] = True 
        user = Usuario.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para visualizar e editar os dados do perfil do usuário.
    """
    empresa = EmpresaSerializer(read_only=True)
    has_active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'first_name', 'last_name', 'nivel_acesso',
            'empresa', 'has_active_subscription'
        ]
        read_only_fields = ['email', 'id', 'empresa', 'has_active_subscription', 'nivel_acesso']

    def get_has_active_subscription(self, obj):
        try:
            assinatura = getattr(getattr(obj, 'empresa', None), 'assinatura', None)
            return bool(assinatura and getattr(assinatura, 'status', None) == 'ativa')
        except Exception:
            return False

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


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ['theme', 'updated_at']
        read_only_fields = ['updated_at']

    def validate_theme(self, value: str) -> str:
        allowed = {choice for choice, _ in UserPreference.THEME_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("Tema inválido. Use 'light', 'dark' ou 'system'.")
        return value
    
class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer para solicitar a redefinição de senha.
    Apenas valida o campo de e-mail.
    """
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()

class PasswordResetValidateCodeSerializer(serializers.Serializer):
    """
    Serializer para validar o código de redefinição.
    """
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    
    def validate_email(self, value):
        return value.lower()

class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar a nova senha.
    """
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_email(self, value):
        return value.lower()

class PlanoSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source='get_nome_display')
    
    class Meta:
        model = Plano
        fields = ['id_plano', 'nome', 'preco_mensal']

class AssinaturaSerializer(serializers.ModelSerializer):
    plano = PlanoSerializer(read_only=True)
    status = serializers.CharField(source='get_status_display')

    class Meta:
        model = Assinatura
        fields = ['id_assinatura', 'plano', 'status', 'data_proximo_pagamento'] 

class PagamentoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Pagamento
        fields = ['id_pagamento', 'data_pagamento', 'valor', 'status']