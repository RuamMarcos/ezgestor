from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Empresa, Usuario
from estoque.models import Produto
from vendas.models import Venda

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')
        
        # Criar empresa de teste
        empresa, created = Empresa.objects.get_or_create(
            cnpj='12345678000123',
            defaults={
                'nome_fantasia': 'Empresa Teste',
                'razao_social': 'Empresa Teste LTDA',
            }
        )
        
        if created:
            self.stdout.write(f'✅ Empresa criada: {empresa.nome_fantasia}')
        else:
            self.stdout.write(f'ℹ️ Empresa já existe: {empresa.nome_fantasia}')
        
        # Criar usuário de teste
        try:
            usuario = Usuario.objects.get(email='admin@test.com')
            self.stdout.write(f'ℹ️ Usuário já existe: {usuario.email}')
        except Usuario.DoesNotExist:
            usuario = Usuario.objects.create_user(
                email='admin@test.com',
                password='123456',
                first_name='Admin',
                last_name='Teste',
                empresa=empresa,
                nivel_acesso='administrador'
            )
            self.stdout.write(f'✅ Usuário criado: {usuario.email}')
        
        # Criar produtos de teste
        produtos_teste = [
            {
                'nome': 'Camiseta Polo',
                'codigo_do_produto': 'CAM001',
                'preco_venda': 45.00,
                'preco_custo': 25.00,
                'quantidade_estoque': 50,
                'quantidade_minima_estoque': 10,
            },
            {
                'nome': 'Tênis Esportivo',
                'codigo_do_produto': 'TEN001',
                'preco_venda': 120.00,
                'preco_custo': 80.00,
                'quantidade_estoque': 30,
                'quantidade_minima_estoque': 5,
            },
            {
                'nome': 'Mochila Executiva',
                'codigo_do_produto': 'MOC001',
                'preco_venda': 85.00,
                'preco_custo': 50.00,
                'quantidade_estoque': 20,
                'quantidade_minima_estoque': 3,
            },
            {
                'nome': 'Boné Aba Reta',
                'codigo_do_produto': 'BON001',
                'preco_venda': 35.00,
                'preco_custo': 15.00,
                'quantidade_estoque': 40,
                'quantidade_minima_estoque': 8,
            },
            {
                'nome': 'Relógio Digital',
                'codigo_do_produto': 'REL001',
                'preco_venda': 150.00,
                'preco_custo': 100.00,
                'quantidade_estoque': 15,
                'quantidade_minima_estoque': 2,
            },
        ]
        
        for produto_data in produtos_teste:
            produto, created = Produto.objects.get_or_create(
                empresa=empresa,
                codigo_do_produto=produto_data['codigo_do_produto'],
                defaults=produto_data
            )
            
            if created:
                self.stdout.write(f'✅ Produto criado: {produto.nome}')
            else:
                self.stdout.write(f'ℹ️ Produto já existe: {produto.nome}')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Dados de teste criados com sucesso!')
        )
        self.stdout.write(f'📧 Email: admin@test.com')
        self.stdout.write(f'🔑 Senha: 123456')
        self.stdout.write(f'🏢 Empresa: {empresa.nome_fantasia}')
        self.stdout.write(f'📦 Produtos: {Produto.objects.filter(empresa=empresa).count()}')