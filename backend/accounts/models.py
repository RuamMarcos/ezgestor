from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

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

    def __str__(self):
        return f"{self.empresa.nome_fantasia} - {self.plano.get_nome_display()}"


# class Produto(models.Model):
#     id_produto = models.AutoField(primary_key=True)
#     empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="produtos")
#     codigo_do_produto = models.CharField(max_length=100)
#     nome = models.CharField(max_length=255)
#     preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
#     preco_custo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     quantidade_estoque = models.IntegerField()

#     def __str__(self):
#         return f"{self.nome} ({self.empresa.nome_fantasia})"


# class Cliente(models.Model):
#     id_cliente = models.AutoField(primary_key=True)
#     empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="clientes")
#     nome = models.CharField(max_length=255)
#     telefone = models.CharField(max_length=20, null=True, blank=True)
#     email = models.EmailField(null=True, blank=True)

#     def __str__(self):
#         return self.nome


# class Venda(models.Model):
#     STATUS_CHOICES = [
#         ('concluida', 'Concluída'),
#         ('cancelada', 'Cancelada'),
#     ]

#     id_venda = models.AutoField(primary_key=True)
#     empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="vendas")
#     cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name="vendas")
#     data_venda = models.DateTimeField(auto_now_add=True)
#     valor_total = models.DecimalField(max_digits=10, decimal_places=2)
#     forma_pagamento = models.CharField(max_length=50)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES)

#     def __str__(self):
#         return f"Venda {self.id_venda} - {self.empresa.nome_fantasia}"


# class ItemVenda(models.Model):
#     id_item_venda = models.AutoField(primary_key=True)
#     venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name="itens")
#     produto = models.ForeignKey(Produto, on_delete=models.PROTECT, related_name="itens_venda")
#     quantidade = models.PositiveIntegerField()
#     preco_unitario_na_venda = models.DecimalField(max_digits=10, decimal_places=2)

#     def __str__(self):
#         return f"Item {self.produto.nome} (Venda {self.venda.id_venda})"


# class LancamentoFinanceiro(models.Model):
#     TIPO_CHOICES = [
#         ('entrada', 'Entrada'),
#         ('saida', 'Saída'),
#     ]

#     id_lancamento = models.AutoField(primary_key=True)
#     empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="lancamentos")
#     venda = models.ForeignKey(Venda, on_delete=models.SET_NULL, null=True, blank=True, related_name="lancamentos")
#     descricao = models.CharField(max_length=255)
#     valor = models.DecimalField(max_digits=10, decimal_places=2)
#     tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
#     data_lancamento = models.DateField(auto_now_add=True)
#     categoria = models.CharField(max_length=100)

#     def __str__(self):
#         return f"{self.tipo.upper()} - {self.valor} ({self.empresa.nome_fantasia})"
