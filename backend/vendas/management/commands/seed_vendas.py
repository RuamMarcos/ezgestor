import random
from django.core.management.base import BaseCommand
from faker import Faker
from accounts.models import Usuario
from estoque.models import Produto
from vendas.models import Venda

class Command(BaseCommand):
    help = 'Popula o banco de dados com dados de vendas falsos para teste.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Iniciando a população do banco de dados com vendas...")

        # Limpa as vendas existentes para evitar duplicação a cada execução
        Venda.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Vendas antigas foram removidas.'))

        fake = Faker('pt_BR')

        # Busca usuários e produtos existentes para criar relações realistas
        vendedores = list(Usuario.objects.all())
        produtos = list(Produto.objects.all())

        if not vendedores or not produtos:
            self.stdout.write(self.style.ERROR(
                'É necessário ter pelo menos um usuário e um produto cadastrado para gerar vendas.'
            ))
            return

        vendas_a_criar = []
        numero_de_vendas = 50

        for _ in range(numero_de_vendas):
            # Escolhe um produto e um vendedor aleatoriamente
            produto_vendido = random.choice(produtos)
            vendedor_responsavel = random.choice(vendedores)
            
            # Gera dados aleatórios
            quantidade = random.randint(1, 5)
            preco_total = produto_vendido.preco_venda * quantidade

            venda = Venda(
                vendedor=vendedor_responsavel,
                produto=produto_vendido,
                quantidade=quantidade,
                preco_total=preco_total,
                # Gera uma data aleatória nos últimos 90 dias
                data_venda=fake.date_time_between(start_date='-90d', end_date='now', tzinfo=None)
            )
            vendas_a_criar.append(venda)

        # Usa bulk_create para criar todos os objetos de uma vez, é mais eficiente
        Venda.objects.bulk_create(vendas_a_criar)

        self.stdout.write(self.style.SUCCESS(
            f'{numero_de_vendas} vendas foram criadas com sucesso!'
        ))