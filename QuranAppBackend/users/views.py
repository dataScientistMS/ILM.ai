from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from .models import UserILM, EmailVerificationToken
from django.conf import settings
from django.urls import reverse
from django.shortcuts import render

@api_view(['POST'])
def signup(request):
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    password = request.data.get('password')
    date_of_birth = request.data.get('date_of_birth')

    if not all([email, first_name, last_name, password, date_of_birth]):
        return Response({'status': 'error', 'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'status': 'error', 'message': 'Email already in use'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=email,  # Assuming username is same as email
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            is_active=False
        )
       
        UserILM.objects.create(user=user, date_of_birth=date_of_birth)
        send_verification_email(user)
        
        return Response({'status': 'success', 'message': 'User registered successfully. Check your email to verify your account.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_verification_email(user):
    token = EmailVerificationToken.objects.create(user=user)
    verification_link = f"https://ilm-ai-backend-1a3893a877c9.herokuapp.com/users/verify-email/{token.token}/"
    subject = 'Verify your email address'
    message = f'Hi {user.first_name},\n\nPlease verify your email address by clicking the link below:\n\n{verification_link}\n\nThank you!'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]
    send_mail(subject, message, from_email, recipient_list)

@api_view(['GET'])
def verify_email(request, token):
    try:
        verification_token = EmailVerificationToken.objects.get(token=token)
        user = verification_token.user
        user.is_active = True
        user.save()
        verification_token.delete()  # Supprime le token après vérification réussie
        return render(request, 'verification_success.html')
    except EmailVerificationToken.DoesNotExist:
        return Response({'status': 'error', 'message': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)