from django.core.management.base import BaseCommand
from InitialQuestions.models import DailyContentTracker, DailyContent

class Command(BaseCommand):
    help = "Incrémente l'ID pour le contenu quotidien"

    def handle(self, *args, **kwargs):
        # Récupérer ou créer le tracker
        tracker = DailyContentTracker.objects.get(id=1)

        # Calculer le prochain ID
        next_id = tracker.current_id + 1

        # Vérifier si l'ID suivant existe
        if DailyContent.objects.filter(id=next_id).exists():
            tracker.current_id = next_id
        else:
            # Réinitialiser à 1 si aucun contenu suivant n'existe
            tracker.current_id = 1

        # Sauvegarder le tracker
        tracker.save()

        # Afficher un message dans la console
        self.stdout.write(self.style.SUCCESS(f"ID actuel mis à jour : {tracker.current_id}"))
