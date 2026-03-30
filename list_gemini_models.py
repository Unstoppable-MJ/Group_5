import google.generativeai as genai
from django.conf import settings
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

genai.configure(api_key=settings.GEMINI_API_KEY)

print("Listing models...")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(m.name)
