# /backend/accounts/views.py
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import date, timedelta
from .serializers import (
    MyTokenObtainPairSerializer, 
    EmpresaRegistrationSerializer,
    ProcessarPagamentoSerializer, 
    TeamMemberSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    UsuarioSerializer,
    TeamMemberUpdateSerializer,
    EmpresaSerializer,
    # Imports Adicionados
    PasswordResetRequestSerializer,
    PasswordResetValidateCodeSerializer,
    PasswordResetConfirmSerializer
)
from .models import Empresa, Usuario, Plano, Assinatura, Pagamento, PasswordResetCode # Model Adicionado
from .permissions import IsAdminUser
import random
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth.signals import user_logged_in 


class EmpresaProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para um administrador visualizar e editar os dados da sua empresa.
    """
    serializer_class = EmpresaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_object(self):
        return self.request.user.empresa

# View de login (obtenção de token)
@method_decorator(csrf_exempt, name='dispatch')
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        except Exception as e:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        if hasattr(serializer, 'user'):
            user_logged_in.send(sender=serializer.user.__class__,
                                request=request,
                                user=serializer.user)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

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

class TeamMemberListView(generics.ListAPIView):
    """
    Endpoint para listar todos os membros da equipe da empresa do admin logado.
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        empresa_usuario_logado = self.request.user.empresa
        return Usuario.objects.filter(empresa=empresa_usuario_logado).order_by('first_name')

class TeamMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint para ver, editar, desativar (is_active=False) ou excluir 
    um membro específico da equipe.
    """
    serializer_class = TeamMemberUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    lookup_field = 'pk' 

    def get_queryset(self):
        empresa_usuario_logado = self.request.user.empresa
        return Usuario.objects.filter(empresa=empresa_usuario_logado)

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

            assinatura = Assinatura.objects.create(
                empresa=empresa,
                plano=plano,
                data_inicio=date.today(),
                data_proximo_pagamento=date.today() + timedelta(days=30), # Próximo pagamento em 30 dias
                status='ativa',
                meses_ativos=1
            )

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

class PasswordResetRequestView(generics.GenericAPIView):
    """
    Endpoint para solicitar um código de recuperação de senha.
    Recebe um e-mail.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        try:
            user = Usuario.objects.get(email=email)
            
            PasswordResetCode.objects.filter(user=user).delete()
            
            code = str(random.randint(100000, 999999))
            PasswordResetCode.objects.create(user=user, code=code)
            
            send_mail(
                subject='Seu código de recuperação de senha EzGestor',
                message=f'Seu código de recuperação de senha é: {code}\n\nEste código expira em 10 minutos.',
                from_email=settings.DEFAULT_FROM_EMAIL, 
                recipient_list=[email],
                fail_silently=False,
            )
        except Usuario.DoesNotExist:
            pass 
        except Exception as e:
            print(f"Erro ao enviar email de recuperação: {e}")
            pass

        return Response(
            {"detail": "Caso esse e-mail exista em nossa base, um código de recuperação foi enviado."},
            status=status.HTTP_200_OK
        )

class PasswordResetValidateCodeView(generics.GenericAPIView):
    """
    Endpoint para validar o código de 6 dígitos.
    Recebe e-mail e código.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetValidateCodeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        
        expiration_time = timezone.now() - timedelta(minutes=10)

        try:
            user = Usuario.objects.get(email=email)
            reset_code = PasswordResetCode.objects.get(
                user=user, 
                code=code,
                created_at__gte=expiration_time
            )
            
            return Response({"detail": "Código validado com sucesso."}, status=status.HTTP_200_OK)

        except (Usuario.DoesNotExist, PasswordResetCode.DoesNotExist):
            return Response({"detail": "Código inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Endpoint para definir a nova senha.
    Recebe e-mail, código e a nova senha.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        expiration_time = timezone.now() - timedelta(minutes=10) 

        try:
            user = Usuario.objects.get(email=email)
            reset_code = PasswordResetCode.objects.get(
                user=user, 
                code=code,
                created_at__gte=expiration_time
            )

            user.set_password(new_password)
            user.save()
            
            reset_code.delete()
            
            return Response({"detail": "Senha alterada com sucesso."}, status=status.HTTP_200_OK)

        except (Usuario.DoesNotExist, PasswordResetCode.DoesNotExist):
            return Response({"detail": "Código inválido ou expirado. Tente novamente."}, status=status.HTTP_400_BAD_REQUEST)