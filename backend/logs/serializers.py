# backend/logs/serializers.py

from rest_framework import serializers
from .models import Log
from accounts.models import CustomUser

class LogUserSerializer(serializers.ModelSerializer):
    """Serializer simplificado para mostrar quem fez a ação no log."""
    class Meta:
        model = CustomUser
        fields = ['id_usuario', 'username', 'email']
        read_only = True

class LogSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir os logs de auditoria.
    """
    # 'user' será um objeto com username e email, e não apenas o ID
    user = LogUserSerializer(read_only=True)
    
    # 'action_type_display' vai mostrar o texto (ex: "Criação")
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)

    class Meta:
        model = Log
        fields = [
            'id', 
            'user', 
            'action_time', 
            'action_type', 
            'action_type_display', 
            'model_name', 
            'object_id', 
            'description'
        ]
        # Este endpoint é apenas para leitura
        read_only_fields = fields