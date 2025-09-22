from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import date, timedelta #
from .serializers import (
    MyTokenObtainPairSerializer, 
    EmpresaRegistrationSerializer,
    ProcessarPagamentoSerializer, 
    TeamMemberSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)
from .models import Empresa, Usuario, Plano, Assinatura, Pagamento 
from .permissions import IsAdminUser

# View de login (obtenção de token)
@method_decorator(csrf_exempt, name='dispatch')
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# View de cadastro de empresa
class EmpresaRegistrationView(generics.CreateAPIView):
    queryset = Empresa.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = EmpresaRegistrationSerializer

# View para Adicionar Membros da Equipa
class TeamMemberCreateView(generics.CreateAPIView):
    serializer_class = TeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)

# View para Logout
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

# View para Visualizar e Editar Perfil
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

# View para Trocar a Senha
class ChangePasswordView(generics.UpdateAPIView):
    """
    Endpoint para um usuário alterar a sua própria senha.
    """
    serializer_class = ChangePasswordSerializer
    model = Usuario
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Verificar senha antiga
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Senha antiga incorrecta."]}, status=status.HTTP_400_BAD_REQUEST)
            # Definir nova senha
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "senha alterada com sucesso"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProcessarPagamentoView(APIView):
    """
    Cria a assinatura da empresa e registra o primeiro pagamento.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ProcessarPagamentoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        plano_id = serializer.validated_data['plano_id']
        metodo_pagamento = serializer.validated_data['metodo']
        
        empresa = request.user.empresa
        if not empresa:
            return Response({"detail": "Usuário não associado a uma empresa."}, status=status.HTTP_400_BAD_REQUEST)

        # Evita criar múltiplas assinaturas
        if Assinatura.objects.filter(empresa=empresa).exists():
            return Response({"detail": "Esta empresa já possui uma assinatura."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plano = Plano.objects.get(pk=plano_id)

            # Cria a Assinatura
            assinatura = Assinatura.objects.create(
                empresa=empresa,
                plano=plano,
                data_inicio=date.today(),
                data_proximo_pagamento=date.today() + timedelta(days=30), # Próximo pagamento em 30 dias
                status='ativa',
                meses_ativos=1
            )

            # Cria o primeiro Pagamento
            Pagamento.objects.create(
                assinatura=assinatura,
                valor=plano.preco_mensal,
                metodo=metodo_pagamento,
                status='confirmado'
            )

            return Response({"status": "Assinatura criada com sucesso!"}, status=status.HTTP_201_CREATED)

        except Plano.DoesNotExist:
            return Response({"detail": "Plano inválido."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": f"Ocorreu um erro: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
