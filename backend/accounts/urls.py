from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    MyTokenObtainPairView, 
    EmpresaRegistrationView, 
    TeamMemberCreateView, 
    LogoutView,
    UserProfileView,
    ChangePasswordView
)

urlpatterns = [
    # Auth
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User Management
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('register/', EmpresaRegistrationView.as_view(), name='empresa_register'),
    path('team/add/', TeamMemberCreateView.as_view(), name='team_member_add'),
]

