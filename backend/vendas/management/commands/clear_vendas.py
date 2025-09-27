from django.core.management.base import BaseCommand
from vendas.models import Venda

class Command(BaseCommand):
    help = 'Remove todos os registros de vendas do banco de dados.'

    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.WARNING('Você está prestes a deletar TODAS as vendas. Isso não pode ser desfeito.')
        )
        confirmacao = input('Digite "sim" para confirmar: ')

        if confirmacao.lower() == 'sim':
            count, _ = Venda.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'{count} vendas foram removidas com sucesso!'))
        else:
            self.stdout.write(self.style.ERROR('Operação cancelada.'))