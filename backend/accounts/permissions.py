from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permissão customizada para permitir acesso apenas a usuários com
    o nível de acesso 'administrador'.
    """
    def has_permission(self, request, view):
        # Checa se o usuário está logado e se seu nível é 'administrador'
        return bool(request.user and request.user.is_authenticated and request.user.nivel_acesso == 'administrador')


class IsFuncionarioOrAdmin(permissions.BasePermission):
    """
    Permissão que permite acesso a funcionários e administradores.
    Usado para Vendas e Estoque.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.nivel_acesso in ['funcionario', 'administrador']
        )
