# backend/logs/serializers.py

from rest_framework import serializers
from .models import Log
from accounts.models import Usuario

class LogUserSerializer(serializers.ModelSerializer):
    """Serializer simplificado para mostrar quem fez a ação no log."""
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name']
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


class LogCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criar logs de auditoria via API.
    O campo 'user' é definido pelo request.user no view e não pode ser enviado pelo cliente.
    """
    class Meta:
        model = Log
        fields = [
            'action_type',
            'model_name',
            'object_id',
            'description',
        ]
        extra_kwargs = {
            'description': { 'required': True },
            'action_type': { 'required': True },
        }