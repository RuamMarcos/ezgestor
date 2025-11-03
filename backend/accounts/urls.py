# /backend/accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CurrentSubscriptionView,
    MyTokenObtainPairView, 
    EmpresaRegistrationView,
    PaymentHistoryView, 
    TeamMemberCreateView, 
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    ProcessarPagamentoView,
    TeamMemberDetailView,
    TeamMemberListView,
    UserPreferenceView,
    EmpresaProfileView,
    UpdatePaymentMethodView,
    PasswordResetRequestView,
    PasswordResetValidateCodeView,
    PasswordResetConfirmView
)

urlpatterns = [
    # Auth
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User & Empresa Management
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('register/', EmpresaRegistrationView.as_view(), name='empresa_register'),

    path('team/add/', TeamMemberCreateView.as_view(), name='team_member_add'),
    path('team/members/', TeamMemberListView.as_view(), name='team_member_list'), 
    path('team/member/<int:pk>/', TeamMemberDetailView.as_view(), name='team_member_detail'), 

    path('payment/process/', ProcessarPagamentoView.as_view(), name='processar_pagamento'),
    path('profile/empresa/', EmpresaProfileView.as_view(), name='empresa_profile'),

    # Preferences
    path('me/preferences/', UserPreferenceView.as_view(), name='user_preferences'),

    # password recover
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/validate-code/', PasswordResetValidateCodeView.as_view(), name='password_reset_validate_code'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    path('signature/', CurrentSubscriptionView.as_view(), name='current-subscription'),
    path('payment/', PaymentHistoryView.as_view(), name='payment-history'),
    path('update-payment-method/', UpdatePaymentMethodView.as_view(), name='update-payment-method')
]