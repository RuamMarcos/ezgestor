import os, sys
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
sys.path.append(str(BASE))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ezgestor_api.settings")

import django
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
email = "testbundle@example.com"
password = "Test12345!"
user, created = User.objects.get_or_create(email=email)
if created:
    user.set_password(password)
    user.save()

refresh = RefreshToken.for_user(user)
access = str(refresh.access_token)

client = Client()
headers = {"HTTP_AUTHORIZATION": f"Bearer {access}"}

resp = client.get("/api/relatorios/bundle/?format=csv", **headers)
print("status:", resp.status_code)
print("content-type:", resp.get("Content-Type"))
print("content-disposition:", resp.get("Content-Disposition"))
print("first-bytes:", resp.content[:4])
print("size:", len(resp.content))
