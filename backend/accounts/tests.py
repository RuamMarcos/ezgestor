from django.test import TestCase
from .models import Empresa, Usuario

class EmpresaModelTestCase(TestCase):
    def setUp(self):
        self.empresa = Empresa.objects.create(
            nome_fantasia='Empresa Teste',
            razao_social='Empresa Teste LTDA',
            cnpj='12.345.678/0001-90'
        )

    def test_empresa_criada(self):
        self.assertIsNotNone(self.empresa)
        self.assertEqual(self.empresa.nome_fantasia, 'Empresa Teste')
        self.assertEqual(self.empresa.razao_social, 'Empresa Teste LTDA')
        self.assertEqual(self.empresa.cnpj, '12.345.678/0001-90')

class UsuarioModelTestCase(TestCase):
    def setUp(self):
        self.empresa = Empresa.objects.create(
            nome_fantasia='Empresa Teste',
            razao_social='Empresa Teste LTDA',
            cnpj='12.345.678/0001-90'
        )
        self.usuario = Usuario.objects.create(
            empresa=self.empresa,
            nome='Usuário Teste',
            email='usuario@teste.com',
            senha_hash='hash123',
            nivel_acesso='administrador'
        )

    def test_usuario_criado(self):
        self.assertIsNotNone(self.usuario)
        self.assertEqual(self.usuario.nome, 'Usuário Teste')
        self.assertEqual(self.usuario.email, 'usuario@teste.com')
        self.assertEqual(self.usuario.senha_hash, 'hash123')
        self.assertEqual(self.usuario.nivel_acesso, 'administrador')
        self.assertEqual(self.usuario.empresa, self.empresa)