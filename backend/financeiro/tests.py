from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import Empresa, Usuario
from estoque.models import Produto
from vendas.models import Venda
from .models import LancamentoFinanceiro

class FinanceiroAPITestCase(APITestCase):
    def setUp(self):
        """
        Configura o ambiente de teste antes da execução de cada teste.
        Cria uma empresa, um usuário, um produto e autentica o cliente de teste.
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
            empresa=self.empresa
        )
        self.client.force_authenticate(user=self.admin_user)

        self.produto = Produto.objects.create(
            empresa=self.empresa,
            nome='Produto para Venda',
            preco_venda=100.00,
            quantidade_estoque=10
        )

        self.vendas_url = reverse('venda-list')
        self.lancamentos_url = reverse('list-lancamentos')

    def test_criar_lancamento_automatico_com_venda(self):
        """
        Testa se um lançamento financeiro de 'entrada' é criado automaticamente
        quando uma nova venda é registrada com sucesso.
        """
        self.assertEqual(LancamentoFinanceiro.objects.count(), 0)

        venda_data = {
            'produto_id': self.produto.id_produto,
            'quantidade': 2
        }

        response = self.client.post(self.vendas_url, venda_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Venda.objects.count(), 1)
        
        self.assertEqual(LancamentoFinanceiro.objects.count(), 1)
        
        lancamento = LancamentoFinanceiro.objects.first()
        self.assertEqual(lancamento.empresa, self.empresa)
        self.assertEqual(lancamento.tipo, 'entrada')
        self.assertEqual(lancamento.categoria, 'Vendas')
        self.assertEqual(lancamento.valor, self.produto.preco_venda * 2)

    def test_listar_lancamentos_financeiros(self):
        """
        Testa se a API de listagem de lançamentos (extrato) retorna apenas
        os lançamentos pertencentes à empresa do usuário logado.
        """
        LancamentoFinanceiro.objects.create(
            empresa=self.empresa,
            descricao="Lançamento da Empresa 1",
            valor=50.00,
            tipo='entrada'
        )

        outra_empresa = Empresa.objects.create(
            cnpj='11.111.111/0001-11', 
            nome_fantasia='Outra Empresa'
        )
        Usuario.objects.create_user(
            email='outro@admin.com',
            password='senhasecreta',
            empresa=outra_empresa
        )
        LancamentoFinanceiro.objects.create(
            empresa=outra_empresa,
            descricao="Lançamento da Outra Empresa",
            valor=200.00,
            tipo='saida'
        )

        response = self.client.get(self.lancamentos_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['descricao'], "Lançamento da Empresa 1")