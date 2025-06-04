from rest_framework import serializers
from .models import Message,Verse

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'  # ou une liste de champs spécifiques que vous voulez inclure
class VerseSerializer(serializers.ModelSerializer) :
    class Meta:
        model=Verse
        fields='__all__'