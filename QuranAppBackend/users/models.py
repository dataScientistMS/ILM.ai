
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
import uuid

class UserILM(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)


    def __str__(self):
        return f"{self.user.username}'s profile"

class EmailVerificationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification token for {self.user.email}"
