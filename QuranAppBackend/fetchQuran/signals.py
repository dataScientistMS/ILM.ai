import json
from .models import Surah, Verse, VerseTranslation

def convert_data_to_json(sender, **kwargs):
    print("Début de la conversion")
    data = {}
    surahs = Surah.objects.all().prefetch_related('verses', 'verses__translations')

    for surah in surahs:
        verses_data = {}

        for verse in surah.verses.all():
            verse_data = {
                'text_uthmani': verse.text_uthmani,
                'translations': {},
                'recitation':verse.recitation
                
                
            }

            for translation in verse.translations.all():
                verse_data['translations'][translation.language] = {
                    'text': translation.text,
                    'author': translation.author
                }
            _, verse_num_str = verse.verse_key.split(":")
            # Utiliser l'ID du verset comme clé dans le dictionnaire des versets
            verses_data[verse_num_str] = verse_data

        # Ajouter le dictionnaire des versets à la sourate correspondante
        data[surah.id] = {
            'name_simple': surah.name_simple,
            'verses': verses_data
        }

    # Écriture du dictionnaire dans un fichier JSON
    with open('quran_data.json', 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    print("Conversion terminée")


def load_quran_data(sender,**kwargs):
        # Charger les données JSON en mémoire
    print("file loaded")
    try:
        with open('quran_data.json', 'r', encoding='utf-8') as file:
            sender.quran_data = json.load(file)
    except IOError:
        print("Erreur lors de la lecture du fichier quran_data.json")
        # Gérer l'erreur comme nécessaire

def load_hadith_data(sender,**kwargs):
        # Charger les données JSON en mémoire
    print("hadith file loaded")
    try:
        with open('merged_collections.json', 'r', encoding='utf-8') as file:
            sender.hadith_data = json.load(file)
    except IOError:
        print("Erreur lors de la lecture du fichier quran_data.json")
        # Gérer l'erreur comme nécessaire