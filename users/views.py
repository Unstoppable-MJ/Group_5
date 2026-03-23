import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .telegram_service import TelegramService

# -----------------------------
# 🤖 TELEGRAM WEBHOOK VIEW
# -----------------------------
class TelegramWebhookView(APIView):
    # This view will receive updates from Telegram
    def post(self, request):
        print("\n--- 🤖 TELEGRAM WEBHOOK RECEIVED ---")
        data = request.data
        print(f"Request Body: {data}")
        
        if 'message' in data:
            message = data['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            username = message.get('from', {}).get('username', 'N/A')
            
            print(f"Chat ID: {chat_id}")
            print(f"Username: {username}")
            print(f"Text: {text}")

            if text == '/start':
                # Ask for phone number using a reply keyboard markup
                reply_markup = {
                    "keyboard": [[{
                        "text": "Share Phone Number",
                        "request_contact": True
                    }]],
                    "one_time_keyboard": True,
                    "resize_keyboard": True
                }
                TelegramService.send_message(chat_id, "Welcome to ChatSense OTP System! Please click the button below to link your phone number.", reply_markup=reply_markup)
                
            elif 'contact' in message:
                contact = message['contact']
                phone_number = contact['phone_number'].replace('+', '')
                # Find user with this phone number and map chat_id
                try:
                    profile = UserProfile.objects.get(phone_number__icontains=phone_number[-10:])
                    profile.telegram_chat_id = chat_id
                    profile.save()
                    TelegramService.send_message(chat_id, f"Successfully linked! You can now receive OTPs for login and password reset.")
                except UserProfile.DoesNotExist:
                    TelegramService.send_message(chat_id, "Sorry, we couldn't find an account with this phone number. Please register on the ChatSense website first.")
            
            elif len(text) == 6 and text.isdigit():
                # Check if it's a linking code
                try:
                    profile = UserProfile.objects.get(linking_code=text)
                    profile.telegram_chat_id = chat_id
                    profile.linking_code = None  # Clear it after use
                    profile.save()
                    TelegramService.send_message(chat_id, f"Successfully linked to account: {profile.user.username}! You can now receive OTPs.")
                except UserProfile.DoesNotExist:
                    # Not a linking code, maybe just ignore or send a help message
                    pass
        
        return Response({"ok": True}, status=status.HTTP_200_OK)

# -----------------------------
# 🔑 OTP VIEWS
# -----------------------------

class RequestOTPView(APIView):
    def post(self, request):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response({"error": "Phone number is required"}, status=400)

        try:
            profile = UserProfile.objects.get(phone_number__icontains=phone_number[-10:])
            if not profile.telegram_chat_id:
                return Response({"error": "Please connect your Telegram first by sending /start to our bot"}, status=400)

            # Generate OTP
            otp = str(random.randint(100000, 999999))
            profile.otp = otp
            profile.otp_expiry = timezone.now() + timedelta(minutes=5)
            profile.otp_attempts = 0
            profile.save()

            # Send OTP
            sent = TelegramService.send_otp(profile.telegram_chat_id, otp)
            if sent:
                return Response({"message": "OTP sent successfully to your Telegram"})
            return Response({"error": "Failed to send OTP. Please try again."}, status=500)

        except UserProfile.DoesNotExist:
            return Response({"error": "No account found with this phone number"}, status=404)

class VerifyOTPLoginView(APIView):
    def post(self, request):
        phone_number = request.data.get("phone_number")
        otp = request.data.get("otp")

        if not phone_number or not otp:
            return Response({"error": "Phone and OTP are required"}, status=400)

        try:
            profile = UserProfile.objects.get(phone_number__icontains=phone_number[-10:])
            if profile.is_otp_valid(otp):
                # Clear OTP after successful use
                profile.otp = None
                profile.save()
                
                user = profile.user
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    "message": "Login successful",
                    "token": token.key,
                    "username": user.username,
                    "user_id": user.id
                })
            else:
                return Response({"error": "Invalid or expired OTP"}, status=401)
        except UserProfile.DoesNotExist:
            return Response({"error": "Invalid phone number"}, status=404)

class ForgotPasswordResetView(APIView):
    def post(self, request):
        phone_number = request.data.get("phone_number")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not all([phone_number, otp, new_password]):
            return Response({"error": "All fields are required"}, status=400)

        try:
            profile = UserProfile.objects.get(phone_number__icontains=phone_number[-10:])
            if profile.is_otp_valid(otp):
                user = profile.user
                user.set_password(new_password)
                user.save()
                
                # Clear OTP
                profile.otp = None
                profile.save()
                
                return Response({"message": "Password reset successfully. You can now login with your new password."})
            else:
                return Response({"error": "Invalid or expired OTP"}, status=401)
        except UserProfile.DoesNotExist:
            return Response({"error": "Invalid phone number"}, status=404)

class GenerateLinkingCodeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile:
            # Create profile if it doesn't exist (safety)
            profile = UserProfile.objects.create(user=request.user)
            
        linking_code = str(random.randint(100000, 999999))
        profile.linking_code = linking_code
        profile.save()
        return Response({"linking_code": linking_code})
