from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question,DailyContent, DailyContentTracker
from .serializers import QuestionSerializer,DailyContentSerializer
from django.db.models import Count
from rest_framework import status
import random

@api_view(['GET'])
def get_initial_questions(request):
    # Récupérer toutes les questions actives
    questions = Question.objects.filter(active=True)
    
    # Sélectionner aléatoirement 6 questions si disponible
    question_count = questions.count()
    if question_count > 6:
        questions = random.sample(list(questions), 6)
    else:
        questions = questions[:6]
    
    # Sérialiser les données
    serializer = QuestionSerializer(questions, many=True)
    
    return Response(serializer.data)


@api_view(['GET'])
def get_daily_content(request):
    # Récupérer ou initialiser le tracker
    tracker = DailyContentTracker.objects.get(id=1)

    # Récupérer le contenu correspondant à l'ID actuel
    content = DailyContent.objects.filter(id=tracker.current_id).first()

    if not content:
        return Response(
            {"error": "Aucun contenu disponible pour l'ID actuel."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Sérialiser et retourner le contenu
    serializer = DailyContentSerializer(content)
    return Response(serializer.data, status=status.HTTP_200_OK)