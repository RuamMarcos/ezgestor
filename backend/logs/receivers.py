
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import Log

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """
    Registra o login do usuário no sistema.
    """
    Log.objects.create(
        user=user,
        action_type='LOGIN',
        model_name='Usuario',
        object_id=user.pk,
        description=f"Usuário '{user.email}' logou no sistema."
    )