from django.apps import AppConfig
from django.db.models.signals import post_migrate

def create_initial_plans(sender, **kwargs):
    """
    Cria os planos iniciais do sistema após as migrações.
    """
    # Importa o modelo Plano dentro da função para evitar importação circular
    from .models import Plano
    
    planos = [
        {'nome': 'padrao', 'preco_mensal': 29.99},
    ]

    for plano_data in planos:
        # Usa get_or_create para evitar duplicatas se os planos já existirem
        Plano.objects.get_or_create(nome=plano_data['nome'], defaults={'preco_mensal': plano_data['preco_mensal']})
    print("Planos iniciais verificados/criados com sucesso.")


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        """
        Este método é chamado quando o Django inicializa o aplicativo.
        É o local ideal para conectar os sinais.
        """
        # Conecta a função create_initial_plans ao sinal post_migrate
        post_migrate.connect(create_initial_plans, sender=self)
