from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    telegram_chat_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.IntegerField(default=0)
    linking_code = models.CharField(max_length=6, null=True, blank=True)

    def is_otp_valid(self, entered_otp):
        if not self.otp or not self.otp_expiry:
            return False
        if timezone.now() > self.otp_expiry:
            return False
        return self.otp == entered_otp

    def __str__(self):
        return self.user.username
