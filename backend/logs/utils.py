# backend/logs/utils.py

from .models import Log

def log_action(user, action_type, instance, custom_description=None):
    """
    Função helper para criar logs padronizados.
    """
    if not user or not hasattr(user, 'is_authenticated') or not user.is_authenticated:
        user = None 

    model_name = instance._meta.model_name
    object_id = instance.pk
    
    if hasattr(instance, 'nome'):
        instance_str = f"'{instance.nome}'"
    else:
        instance_str = f"ID {instance.pk}"

    user_str = user.email if user else "Sistema"

    if custom_description:
        description = custom_description
    else:
        # Cria uma descrição padrão
        action_verb_map = {
            'CREATE': 'criou',
            'UPDATE': 'atualizou',
            'DELETE': 'deletou (hard delete)',
            'SOFT_DELETE': 'desativou (soft delete)',
        }
        action_verb = action_verb_map.get(action_type, 'executou ação em')
        description = f"Usuário '{user_str}' {action_verb} {model_name}: {instance_str} (ID: {object_id})."

    Log.objects.create(
        user=user,
        action_type=action_type,
        model_name=model_name,
        object_id=object_id,
        description=description
    )