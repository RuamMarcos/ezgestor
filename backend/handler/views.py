from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status


class ApiRootView(APIView):
    """
    Ponto de entrada da API que mostra uma mensagem de boas-vindas.
    """
    def get(self, request, format=None):
        return Response({
            'status': 'online',
            'message': 'Bem-vindo à API do EzGestor. A interface de usuário (frontend) está em outro endereço.'
        }, status=status.HTTP_200_OK)


class TesteAPIView(APIView):
    def get(self, request):
        # Simula um retorno de dados em JSON
        data = {"mensagem": "API funcionando!", "status": "ok"}
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        # Recebe dados em JSON e retorna eles de volta
        recebido = request.data
        return Response({"recebido": recebido, "mensagem": "POST recebido com sucesso"}, status=status.HTTP_201_CREATED)
    


# Importe as views ou funções dos outros apps que o handler vai chamar
# Exemplo:
# from produtos.services import listar_produtos
# from vendas.services import criar_nova_venda

class ApiGatewayView(APIView):
    # Garante que apenas usuários logados podem fazer pedidos
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 1. O frontend envia um JSON com uma 'action'
        action = request.data.get('action')
        data = request.data.get('payload')
        
        # 2. O handler age como um "switch"
        if action == 'listar_produtos':
            # Chama a lógica do app de produtos
            # produtos = listar_produtos(empresa=request.user.empresa)
            # return Response(produtos)
            return Response({"mensagem": "Lógica para listar produtos aqui."})

        elif action == 'criar_venda':
            # Chama a lógica do app de vendas
            # nova_venda = criar_nova_venda(usuario=request.user, dados_venda=data)
            # return Response(nova_venda)
            return Response({"mensagem": "Lógica para criar venda aqui."})
            
        else:
            return Response({'error': 'Ação desconhecida'}, status=400)

    def get(self, request, *args, **kwargs):
        # O mesmo pode ser feito para requisições GET
        action = request.query_params.get('action') # Em GET, os parâmetros vêm na URL

        if action == 'obter_dashboard':
            return Response({"mensagem": "Lógica para obter dados do dashboard aqui."})

        return Response({'error': 'Ação desconhecida'}, status=400)

