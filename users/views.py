import logging
import random
from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .telegram_service import TelegramService

logger = logging.getLogger(__name__)


class TelegramWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))

    def post(self, request):
        logger.info("Telegram webhook received")
        data = request.data
        logger.info("Telegram update payload: %s", data)

        try:
            message = data.get("message") or data.get("edited_message")
            if not message:
                logger.info("No message object found in Telegram update")
                return Response({"ok": True}, status=status.HTTP_200_OK)

            chat = message.get("chat", {})
            sender = message.get("from", {})
            chat_id = chat.get("id")
            text = (message.get("text") or "").strip()
            username = sender.get("username", "N/A")

            logger.info("Telegram chat_id=%s username=%s text=%s", chat_id, username, text)

            if not chat_id:
                logger.warning("Telegram update missing chat_id")
                return Response({"ok": True}, status=status.HTTP_200_OK)

            if "contact" in message:
                contact = message["contact"]
                phone_number = str(contact.get("phone_number", "")).replace("+", "")
                try:
                    profile = UserProfile.objects.get(phone_number__icontains=phone_number[-10:])
                    profile.telegram_chat_id = str(chat_id)
                    profile.save()
                    TelegramService.send_message(
                        chat_id,
                        "Successfully linked. You can now receive OTPs for login and password reset."
                    )
                except UserProfile.DoesNotExist:
                    TelegramService.send_message(
                        chat_id,
                        "Sorry, we could not find an account with this phone number. Please register on ChatSense first."
                    )
                return Response({"ok": True}, status=status.HTTP_200_OK)

            if text == "/start":
                reply_markup = {
                    "keyboard": [[{
                        "text": "Share Phone Number",
                        "request_contact": True
                    }]],
                    "one_time_keyboard": True,
                    "resize_keyboard": True,
                }
                TelegramService.send_message(
                    chat_id,
                    "Welcome to ChatSense. Use /otp to receive a 6-digit OTP placeholder, or share your phone number to link your account.",
                    reply_markup=reply_markup,
                )
                return Response({"ok": True}, status=status.HTTP_200_OK)

            if text == "/otp":
                otp = self.generate_otp()
                TelegramService.send_otp(chat_id, otp)
                logger.info("Generated webhook OTP placeholder for chat_id=%s", chat_id)
                return Response({"ok": True}, status=status.HTTP_200_OK)

            if len(text) == 6 and text.isdigit():
                try:
                    profile = UserProfile.objects.get(linking_code=text)
                    profile.telegram_chat_id = str(chat_id)
                    profile.linking_code = None
                    profile.save()
                    TelegramService.send_message(
                        chat_id,
                        f"Successfully linked to account: {profile.user.username}. You can now receive OTPs."
                    )
                except UserProfile.DoesNotExist:
                    TelegramService.send_message(
                        chat_id,
                        "That 6-digit code was not recognized. Send /start for help or /otp to test OTP delivery."
                    )
                return Response({"ok": True}, status=status.HTTP_200_OK)

            TelegramService.send_message(
                chat_id,
                "Command not recognized. Send /start to link your account or /otp to test OTP delivery."
            )
            return Response({"ok": True}, status=status.HTTP_200_OK)
        except Exception as exc:
            logger.exception("Telegram webhook processing failed: %s", exc)
            return Response({"ok": True}, status=status.HTTP_200_OK)


class RequestOTPView(APIView):
    def post(self, request):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response({"error": "Phone number is required"}, status=400)

        try:
            profile = UserProfile.objects.get(phone_number__icontains=phone_number[-10:])
            if not profile.telegram_chat_id:
                return Response({"error": "Please connect your Telegram first by sending /start to our bot"}, status=400)

            otp = str(random.randint(100000, 999999))
            profile.otp = otp
            profile.otp_expiry = timezone.now() + timedelta(minutes=5)
            profile.otp_attempts = 0
            profile.save()

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

                profile.otp = None
                profile.save()

                return Response({"message": "Password reset successfully. You can now login with your new password."})
            return Response({"error": "Invalid or expired OTP"}, status=401)
        except UserProfile.DoesNotExist:
            return Response({"error": "Invalid phone number"}, status=404)


class GenerateLinkingCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, "profile", None)
        if not profile:
            profile = UserProfile.objects.create(user=request.user)

        linking_code = str(random.randint(100000, 999999))
        profile.linking_code = linking_code
        profile.save()
        return Response({"linking_code": linking_code})
