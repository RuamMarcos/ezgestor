from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import Empresa, Usuario
from .models import Produto

class ProdutoAPITestCase(APITestCase):
    def setUp(self):
        """
        Configura o ambiente de teste antes de cada teste ser executado.
        Cria uma empresa, um usuário administrador e o associa à empresa.
        """
        self.empresa = Empresa.objects.create(
            nome_fantasia='Empresa Teste',
            razao_social='Empresa Teste LTDA',
            cnpj='00.000.000/0001-00'
        )
        self.admin_user = Usuario.objects.create_user(
            email='admin@teste.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            empresa=self.empresa,
            nivel_acesso='administrador'
        )
        # Força a autenticação do cliente de teste com o usuário administrador
        self.client.force_authenticate(user=self.admin_user)

        # URLs da API de produtos
        self.list_create_url = reverse('produto-list-create')

    def test_criar_produto(self):
        """
        Testa se um produto pode ser criado com sucesso.
        """
        data = {
            'nome': 'Produto Novo',
            'preco_venda': '199.99',
            'quantidade_estoque': 50,
            'quantidade_minima_estoque': 10
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Produto.objects.count(), 1)
        self.assertEqual(Produto.objects.get().nome, 'Produto Novo')

    def test_listar_produtos(self):
        """
        Testa se a lista de produtos da empresa é retornada corretamente.
        """
        # Cria dois produtos para a empresa
        Produto.objects.create(empresa=self.empresa, nome='Produto A', preco_venda=10.00, quantidade_estoque=20)
        Produto.objects.create(empresa=self.empresa, nome='Produto B', preco_venda=15.00, quantidade_estoque=30)
        
        # Cria uma outra empresa e um produto para ela, para garantir que não seja listado
        outra_empresa = Empresa.objects.create(cnpj='11.111.111/0001-11', nome_fantasia='Outra Empresa')
        Produto.objects.create(empresa=outra_empresa, nome='Produto C', preco_venda=20.00, quantidade_estoque=5)

        response = self.client.get(self.list_create_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Deve retornar apenas os 2 produtos da empresa do usuário

    def test_alerta_baixo_estoque(self):
        """
        Testa a propriedade `em_baixo_estoque`.
        """
        # Produto com estoque acima do mínimo
        produto1 = Produto.objects.create(
            empresa=self.empresa, nome='Produto Ok', preco_venda=10.00, 
            quantidade_estoque=15, quantidade_minima_estoque=10
        )
        # Produto com estoque igual ao mínimo
        produto2 = Produto.objects.create(
            empresa=self.empresa, nome='Produto Alerta', preco_venda=20.00, 
            quantidade_estoque=5, quantidade_minima_estoque=5
        )

        url_produto1 = reverse('produto-detail', kwargs={'id_produto': produto1.id_produto})
        url_produto2 = reverse('produto-detail', kwargs={'id_produto': produto2.id_produto})

        response1 = self.client.get(url_produto1, format='json')
        response2 = self.client.get(url_produto2, format='json')

        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertFalse(response1.data['em_baixo_estoque'])

        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertTrue(response2.data['em_baixo_estoque'])

    def test_atualizar_produto(self):
        """
        Testa a atualização de um produto existente.
        """
        produto = Produto.objects.create(
            empresa=self.empresa, nome='Produto Original', preco_venda=50.00, quantidade_estoque=100
        )
        url = reverse('produto-detail', kwargs={'id_produto': produto.id_produto})
        data = {'nome': 'Produto Atualizado', 'preco_venda': '55.50', 'quantidade_estoque': 90}
        
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        produto_atualizado = Produto.objects.get(id_produto=produto.id_produto)
        self.assertEqual(produto_atualizado.nome, 'Produto Atualizado')
        self.assertEqual(float(produto_atualizado.preco_venda), 55.50)

    def test_deletar_produto(self):
        """
        Testa a remoção de um produto.
        """
        produto = Produto.objects.create(
            empresa=self.empresa, nome='Produto a ser deletado', preco_venda=50.00, quantidade_estoque=100
        )
        url = reverse('produto-detail', kwargs={'id_produto': produto.id_produto})
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Produto.objects.count(), 0)