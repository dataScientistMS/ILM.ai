from rest_framework import serializers
from .models import Question,DailyContent


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'category']

class DailyContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyContent
        fields = ['date', 'verse', 'hadith','tafsir','verseReference','hadithReference']

    