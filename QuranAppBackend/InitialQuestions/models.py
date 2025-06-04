from django.db import models

class Question(models.Model):
    question_text = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)  # Catégorie flexible
    active = models.BooleanField(default=True)
    date_added = models.DateTimeField(auto_now_add=True,null=True)

    def __str__(self):
        return self.question_text

class DailyContent(models.Model):
    date = models.DateField(auto_now_add=True)  # Date de mise à jour
    verse = models.TextField()  # Verset du jour
    hadith = models.TextField()  # Hadith du jour
    tafsir = models.TextField()
    verseReference = models.CharField(max_length=64)
    hadithReference = models.CharField(max_length=64)

class DailyContentTracker(models.Model):
    current_id = models.IntegerField(default=1)  # ID actuel dans DailyContent
