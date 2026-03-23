from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_message_preview', 'is_recommendation', 'timestamp')
    list_filter = ('is_recommendation', 'timestamp', 'user')
    search_fields = ('user_message', 'bot_response', 'user__username')

    def user_message_preview(self, obj):
        return obj.user_message[:50] + "..." if len(obj.user_message) > 50 else obj.user_message
    user_message_preview.short_description = 'User Message'
