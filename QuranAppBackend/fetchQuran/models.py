from django.db import models
from django.contrib.auth.models import User

class Surah(models.Model):
    id = models.AutoField(primary_key=True)
    revelation_place = models.CharField(max_length=100,null=True)
    revelation_order = models.IntegerField(null=True)
    bismillah_pre = models.BooleanField(default=True,null=True)
    english_name = models.CharField(max_length=100,null=True)
    name_simple = models.CharField(max_length=100,null=True)
    name_complex = models.CharField(max_length=100,null=True)
    name_arabic = models.CharField(max_length=100,null=True)
    verses_count = models.IntegerField(null=True)
    pages = models.JSONField(null=True)  # Requiert Django 3.1 ou plus récent

    def __str__(self):
        return self.name_simple

class Verse(models.Model):
    id = models.AutoField(primary_key=True)
    verse_key = models.CharField(max_length=7,null=True)
    text_uthmani = models.TextField(null=True)
    surah = models.ForeignKey(Surah, on_delete=models.CASCADE, related_name='verses',null=True)
    glyph_code=models.CharField(max_length=300,null=True)
    recitation = models.CharField(max_length=100,null=True)


    def __str__(self):
        return f'Surah {self.surah.name_simple} Verse {self.verse_key}'


class VerseTranslation(models.Model):
    id = models.AutoField(primary_key=True)
    verse = models.ForeignKey(Verse, on_delete=models.CASCADE, related_name='translations',default=id)
    language = models.CharField(max_length=30,null=True)
    text = models.TextField(null=True)
    author= models.CharField(max_length=100,null=True)

    def __str__(self):
        return f'{self.verse} [{self.language}]'

    class Meta:
        unique_together = (('verse', 'language'),)


class Chat(models.Model):
    participants = models.ManyToManyField(User)
    title = models.CharField(max_length=128)
    thread_id=models.CharField(max_length=128,default="")
    
    def __str__(self):
        return self.title

class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    references = models.JSONField(default=dict, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    PENDING = 'pending'
    SENT = 'sent'
    FAILED = 'failed'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SENT, 'Sent'),
        (FAILED, 'Failed'),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)

    def __str__(self):
        return f'Message from {self.sender} in {self.chat}'




    
    """
class HadithTable(models.Model):
    collection = models.CharField(max_length=50)
    bookNumber = models.CharField(max_length=20)
    babID = models.DecimalField(max_digits=6, decimal_places=2)
    englishBabNumber = models.CharField(max_length=21, null=True, blank=True)
    arabicBabNumber = models.CharField(max_length=21, null=True, blank=True)
    hadithNumber = models.CharField(max_length=50)
    ourHadithNumber = models.IntegerField()
    arabicURN = models.IntegerField(unique=True)
    arabicBabName = models.TextField(null=True, blank=True)
    arabicText = models.TextField(null=True, blank=True)
    arabicgrade1 = models.CharField(max_length=2000)
    englishURN = models.IntegerField(unique=True)
    englishBabName = models.TextField(null=True, blank=True)
    englishText = models.TextField(null=True, blank=True)
    englishgrade1 = models.CharField(max_length=2000)
    last_updated = models.DateTimeField(null=True, blank=True)
    xrefs = models.CharField(max_length=1000)

    class Meta:
        db_table = 'HadithTable'
        unique_together = (('collection', 'bookNumber'), ('arabicURN', 'englishURN'))

    def __str__(self):
        return f'{self.collection} - {self.hadithNumber}'
    """

