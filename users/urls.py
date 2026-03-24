from django.urls import path
from .views import (
    TelegramWebhookView,
    RequestOTPView,
    VerifyOTPLoginView,
    ForgotPasswordResetView,
    GenerateLinkingCodeView
)

urlpatterns = [
    path('telegram-webhook/', TelegramWebhookView.as_view(), name='telegram-webhook'),
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('verify-otp-login/', VerifyOTPLoginView.as_view(), name='verify-otp-login'),
    path('reset-password-otp/', ForgotPasswordResetView.as_view(), name='reset-password-otp'),
    path('generate-linking-code/', GenerateLinkingCodeView.as_view(), name='generate-linking-code'),
]
