FROM python:3.10-slim

# Variables d'environnement pour Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Installer cron et dépendances nécessaires
RUN apt-get update && apt-get install -y cron && apt-get clean

# Définir le répertoire de travail
WORKDIR /QuranAppBackend

# Copier les fichiers nécessaires
COPY requirements.txt requirements.txt
COPY QuranAppBackend/AuthKey_82YFB4FG3Y.p8 QuranAppBackend/AuthKey_82YFB4FG3Y.p8


# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code dans le conteneur
COPY . .

# Créer dynamiquement le fichier crontab
RUN echo "0 0 * * * /usr/local/bin/python /QuranAppBackend/manage.py increment_daily_content >> /var/log/cron.log 2>&1" > /etc/cron.d/my-crontab

# Donner les permissions nécessaires au fichier crontab
RUN chmod 0644 /etc/cron.d/my-crontab && crontab /etc/cron.d/my-crontab

# Créer un fichier log pour cron
RUN touch /var/log/cron.log

# Exposer le port 8000
EXPOSE 8000

# Lancer cron en arrière-plan et uvicorn
CMD ["sh", "-c", "cron && uvicorn QuranAppBackend.asgi:application --host 0.0.0.0 --port 8000"]