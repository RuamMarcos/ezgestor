from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import Empresa, Usuario
from estoque.models import Produto
from .models import Venda

class VendaAPITestCase(APITestCase):
    def setUp(self):
        """
        Configura o ambiente de teste:
        - Cria duas empresas distintas.
        - Cria um usuário para cada empresa.
        - Cria produtos para a primeira empresa.
        - Cria vendas associadas a esses produtos e usuários.
        """
        # Empresa 1 e seu usuário/produtos
        self.empresa1 = Empresa.objects.create(
            nome_fantasia='Empresa Teste 1',
            cnpj='00.000.000/0001-01'
        )
        self.user1 = Usuario.objects.create_user(
            email='user1@teste.com',
            password='password123',
            empresa=self.empresa1
        )
        self.produto1_empresa1 = Produto.objects.create(
            empresa=self.empresa1, nome='Produto Exclusivo A', preco_venda=100.00, quantidade_estoque=10
        )
        self.produto2_empresa1 = Produto.objects.create(
            empresa=self.empresa1, nome='Produto B', preco_venda=200.00, quantidade_estoque=5
        )

        # Empresa 2 e seu usuário
        self.empresa2 = Empresa.objects.create(
            nome_fantasia='Empresa Teste 2',
            cnpj='00.000.000/0001-02'
        )
        self.user2 = Usuario.objects.create_user(
            email='user2@teste.com',
            password='password123',
            empresa=self.empresa2
        )

        # Vendas para a Empresa 1
        self.venda1 = Venda.objects.create(
            vendedor=self.user1, produto=self.produto1_empresa1, quantidade=1, preco_total=100.00
        )
        self.venda2 = Venda.objects.create(
            vendedor=self.user1, produto=self.produto2_empresa1, quantidade=2, preco_total=400.00
        )

        # URL do endpoint de vendas
        self.vendas_url = reverse('venda-list')

    def test_listar_vendas_autenticado(self):
        """
        Verifica se um usuário autenticado pode listar apenas as vendas de sua própria empresa.
        """
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.vendas_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # O usuário 1 deve ver apenas as 2 vendas de sua empresa
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_nao_listar_vendas_de_outra_empresa(self):
        """
        Garante que um usuário não veja as vendas de outra empresa.
        """
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.vendas_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # O usuário 2 não tem vendas em sua empresa, então o resultado deve ser 0
        self.assertEqual(response.data['count'], 0)

    def test_nao_listar_vendas_sem_autenticacao(self):
        """
        Verifica se o acesso é negado para usuários não autenticados.
        """
        response = self.client.get(self.vendas_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_buscar_venda_por_nome_produto(self):
        """
        Testa a funcionalidade de busca por nome do produto.
        """
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.vendas_url, {'search': 'Produto Exclusivo A'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['nome_produto'], 'Produto Exclusivo A')

    def test_buscar_venda_por_nome_vendedor(self):
        """
        Testa a funcionalidade de busca por nome do vendedor (email).
        """
        self.client.force_authenticate(user=self.user1)
        # A busca é pelo email, que é o username
        response = self.client.get(self.vendas_url, {'search': 'user1@teste.com'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

