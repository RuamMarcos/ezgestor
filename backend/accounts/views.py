from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    MyTokenObtainPairSerializer, 
    EmpresaRegistrationSerializer, 
    TeamMemberSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer
)
from .models import Empresa, Usuario
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

