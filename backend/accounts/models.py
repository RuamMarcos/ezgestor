from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
from django.conf import settings
import uuid

class CustomUserManager(BaseUserManager):
    """
    Gerenciador de usuário customizado onde o email é o identificador único
    para autenticação em vez de usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Cria e salva um Usuário com o email e senha fornecidos.
        """
        if not email:
            raise ValueError('O campo de Email é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Cria e salva um Superusuário com o email e senha fornecidos.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class Empresa(models.Model):
    """
    Modelo para armazenar os dados da empresa.
    O id_empresa é criado automaticamente pelo Django como 'id'.
    """
    nome_fantasia = models.CharField(max_length=255)
    razao_social = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=18, unique=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    logotipo = models.ImageField(upload_to='logotipos/', null=True, blank=True)
    inscricao_estadual = models.CharField(max_length=20, blank=True, null=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    cep = models.CharField(max_length=9, blank=True, null=True)
    bairro = models.CharField(max_length=100, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    estado = models.CharField(max_length=50, blank=True, null=True)
    pais = models.CharField(max_length=50, blank=True, null=True, default='Brasil')
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email_principal = models.EmailField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome_fantasia

class Usuario(AbstractUser):
    """
    Modelo de usuário customizado que estende o User padrão do Django.
    """
    NIVEL_ACESSO_CHOICES = [
        ('administrador', 'Administrador'),
        ('funcionario', 'Funcionário'),
    ]
    
    username = None # Removemos o username
    email = models.EmailField('endereço de email', unique=True)
    
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name='usuarios', null=True, blank=True)
    nivel_acesso = models.CharField(max_length=20, choices=NIVEL_ACESSO_CHOICES, default='funcionario')

    # Define o email como campo de login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    # Informa ao Django para usar nosso Gerenciador customizado
    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Plano(models.Model):
    NOME_CHOICES = [
        ('economico', 'Econômico'),
        ('padrao', 'Padrão'),
        ('avancado', 'Avançado'),
    ]

    id_plano = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=20, choices=NOME_CHOICES)
    preco_mensal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.get_nome_display()


class Assinatura(models.Model):
    STATUS_CHOICES = [
        ('ativa', 'Ativa'),
        ('inadimplente', 'Inadimplente'),
        ('cancelada', 'Cancelada'),
    ]

    id_assinatura = models.AutoField(primary_key=True)
    empresa = models.OneToOneField(Empresa, on_delete=models.CASCADE, related_name="assinatura")
    plano = models.ForeignKey(Plano, on_delete=models.PROTECT, related_name="assinaturas")
    data_inicio = models.DateField()
    data_proximo_pagamento = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    meses_ativos = models.PositiveIntegerField()
    metodo_pagamento_padrao = models.CharField(max_length=20, null=True, blank=True)
    cartao_final = models.CharField(max_length=4, null=True, blank=True)
    cartao_bandeira = models.CharField(max_length=20, null=True, blank=True)
    cartao_validade = models.CharField(max_length=5, null=True, blank=True) # MM/YY

    def __str__(self):
        return f"{self.empresa.nome_fantasia} - {self.plano.get_nome_display()}"


class Pagamento(models.Model):
    id_pagamento = models.AutoField(primary_key=True)
    assinatura = models.ForeignKey(Assinatura, on_delete=models.CASCADE, related_name="pagamentos")
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_pagamento = models.DateTimeField(auto_now_add=True)
    metodo = models.CharField(max_length=50) # ex: 'cartao', 'pix', 'boleto'
    status = models.CharField(max_length=20, default='confirmado')

    def __str__(self):
        return f"Pagamento de {self.valor} para {self.assinatura.empresa.nome_fantasia}"


class UserPreference(models.Model):
    THEME_LIGHT = 'light'
    THEME_DARK = 'dark'
    THEME_SYSTEM = 'system'

    THEME_CHOICES = [
        (THEME_LIGHT, 'Light'),
        (THEME_DARK, 'Dark'),
        (THEME_SYSTEM, 'System'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default=THEME_SYSTEM)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferências de {getattr(self.user, 'email', str(self.user_id))}"
    
class PasswordResetCode(models.Model):
    """
    Modelo para armazenar códigos de recuperação de senha.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reset_codes")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Código para {self.user.email}"