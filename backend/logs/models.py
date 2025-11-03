from django.db import models
from django.conf import settings

class Log(models.Model):
    ACTION_TYPES = [
        ('CREATE', 'Criação'),
        ('UPDATE', 'Atualização'),
        ('DELETE', 'Deleção'),
        ('SOFT_DELETE', 'Desativação'),
        ('LOGIN', 'Login'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Usuário"
    )
    action_time = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Quando"
    )
    action_type = models.CharField(
        max_length=15, 
        choices=ACTION_TYPES,
        verbose_name="Ação"
    )
    model_name = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        verbose_name="Modelo Afetado"
    )
    object_id = models.PositiveIntegerField(
        blank=True, 
        null=True,
        verbose_name="ID do Objeto"
    )
    description = models.TextField(
        verbose_name="Descrição"
    )

    class Meta:
        ordering = ['-action_time']
        verbose_name = "Log de Ação"
        verbose_name_plural = "Logs de Ações"

    def __str__(self):
        return f"{self.action_time.strftime('%Y-%m-%d %H:%M')} - {self.user} - {self.get_action_type_display()}"