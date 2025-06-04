from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from adrf.decorators import api_view
from rest_framework.response import Response
from openai import AsyncOpenAI
from .models import *
from .serializers import MessageSerializer,VerseSerializer
from rest_framework import status
from asgiref.sync import markcoroutinefunction
import asyncio
from asgiref.sync import sync_to_async
import re
from django.db.models import Q
from django.db.models import Prefetch
from django.apps import apps
import time
import json
# Create your views here.

import jwt

from django.conf import settings
import functools

def async_token_required(view_func):
    @functools.wraps(view_func)
    async def _wrapped_view(request, *args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return JsonResponse({'error': 'Authentication token is missing'}, status=403)

        try:
            token = token.split()[1]  # Pour obtenir le token après "Bearer"
            jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=403)

        return await view_func(request, *args, **kwargs)
    
    return _wrapped_view

"""
def extract_sourah_verse_references(text):
    
    Extract sourah and verse numbers from a given text string.
    
    The function looks for patterns like (numsourate:numverset-numversetfin) or (numsourate:numverset)
    and extracts these references into a list.
    
    Args:
    text (str): The string containing the sourah and verse references.

    Returns:
    list of tuples: A list where each tuple contains (numsourate, numverset, numversetfin) or (numsourate, numverset)
    

    try :
        print("extract surah start")
        start_time = time.time()
        # Regular expression to match the pattern (numsourate:numverset-numversetfin) or (numsourate:numverset)
        pattern = r'\((\d+):(\d+)(?:-(\d+))?\)'

        # Find all matches and extract the groups
        matches = re.findall(pattern, text)

        # Convert the matches to a list of tuples (numsourate, numverset, numversetfin) or (numsourate, numverset)
        references = [(int(sourah), int(verse_start), int(verse_end) if verse_end else None) for sourah, verse_start, verse_end in matches]
        end_time = time.time()
        print("extract surah end")
        print(f"extract_sourah_verse_references took {end_time - start_time} seconds")
        return references
    except Exception as e :
        print(e)
"""

def extract_sourah_verse_references(tab) :
    print("start extracting")
    references=[]
    for ref in tab :
        num_sourate,numverse=ref.split(":")
        if "-" in numverse :
            numverse_start,numverse_end=numverse.split("-")
            references.append((num_sourate,numverse_start,numverse_end))
        else :
            references.append((num_sourate,numverse,None))
    print("end extracting")
    print(references)
    return references
        

def extract_hadith_references(tab):
    print("start extracting hadith")
    references=[]
    for ref in tab :
        collection,numhadith=ref.split(":")
        collection=collection.lower()
        references.append((collection,numhadith))
    print("end extracting hadith")
    return references





from django.db.models import Q


def regrouper_references(references):
    print("regrouper ref start")
    start_time = time.time()
    quran_app_config = apps.get_app_config('fetchQuran')
    quran_data = quran_app_config.quran_data
    references_data = []

    for ref in references:
        numsourate, numverset, numversetfin = ref
        numsourate_str = str(numsourate)
        surah = quran_data.get(numsourate_str)

        if surah:
            verses_dict = surah.get("verses", {})
            verses_list = []

            if numversetfin is None:  # Un seul verset
                numverset_str = str(numverset)
                verse = verses_dict.get(numverset_str)
                reference=numsourate_str+':'+numverset_str
                if verse:
                    verses_list.append(verse)
            else:  # Plage de versets
                numverset_str=str(numverset)
                numversetfin_str=str(numversetfin)
                reference=numsourate_str+':'+numverset_str+'-'+numversetfin_str
                for vid in range(int(numverset), int(numversetfin) + 1):
                    vid_str = str(vid)
                    verse = verses_dict.get(vid_str)
                    if verse:
                        verses_list.append(verse)

            if verses_list:
                # Ajout des informations de la sourate et des versets à la liste des références
                reference_data = {
                    'id': numsourate,
                    'reference':reference,
                    'name_simple': surah['name_simple'],
                    'verses': verses_list
                }
                references_data.append(reference_data)
    end_time = time.time()
    print("regrouper ref end")
    print(f"regrouper reference took {end_time - start_time} seconds")
    
    return references_data

def regrouper_references_hadiths(references):
    print("regrouper hadith ref start")
    start_time = time.time()
    hadith_app_config = apps.get_app_config('fetchQuran')
    hadith_data = hadith_app_config.hadith_data
    references_data = []

    for ref in references:
        source, number = ref
        source_data = hadith_data.get(source.lower())

        if source_data:
            hadith = source_data.get(str(number))

            if hadith:
                reference_data = {
                    'source': source,
                    'number': number,
                    'text': hadith.get("translations", {}).get("english", ""),
                    'reference': hadith.get("reference", ""),
                    'inbook_reference': hadith.get("inbook_reference", ""),
                    'narration': hadith.get("narration", "")
                }
                references_data.append(reference_data)
    
    end_time = time.time()
    print("regrouper hadith ref end")
    print(f"regrouper_references_hadiths took {end_time - start_time} seconds")
    
    return references_data








@api_view(['GET'])
def getMessageByChat(request,chat_id) :
    try :
        messages = Message.objects.filter(chat__id=chat_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    except Message.DoesNotExist :
        print("Message or Chat does not exist")
        return HttpResponse("Message or Chat does not exist", status=500)














    
    