import requests
from django.conf import settings

class TelegramService:
    @staticmethod
    def send_message(chat_id, text, reply_markup=None):
        token = getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
        if not token:
            print("TELEGRAM_BOT_TOKEN is not configured in settings.py")
            return False
        
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML"
        }
        if reply_markup:
            payload["reply_markup"] = reply_markup
        try:
            response = requests.post(url, json=payload)
            return response.status_code == 200
        except Exception as e:
            print(f"Error sending Telegram message: {e}")
            return False

    @classmethod
    def send_otp(cls, chat_id, otp):
        text = f"<b>ChatSense OTP</b>\n\nYour One-Time Password is: <code>{otp}</code>\n\nValid for 5 minutes. Do not share this with anyone."
        return cls.send_message(chat_id, text)
