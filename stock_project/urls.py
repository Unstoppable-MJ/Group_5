from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from users.views import TelegramWebhookView

def root_view(request):
    return JsonResponse({
        "status": "ChatSense API is running",
        "endpoints": {
            "chatbot": "/api/chatbot/chat/",
            "stocks": "/api/",
            "users": "/api/users/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', root_view),
    path('webhook', TelegramWebhookView.as_view(), name='telegram-webhook-root'),
    path('webhook/', TelegramWebhookView.as_view(), name='telegram-webhook-root-slash'),
    path('admin/', admin.site.urls),
    path('api/', include('stocks.urls')),
    path('api/users/', include('users.urls')),
    path('api/chatbot/', include('chatbot.urls')),
]
