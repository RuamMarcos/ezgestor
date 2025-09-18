from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status

class TesteAPIView(APIView):
    def get(self, request):
        # Simula um retorno de dados em JSON
        data = {"mensagem": "API funcionando!", "status": "ok"}
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        # Recebe dados em JSON e retorna eles de volta
        recebido = request.data
        return Response({"recebido": recebido, "mensagem": "POST recebido com sucesso"}, status=status.HTTP_201_CREATED)