from django.urls import path 
from . import views
from django.conf import settings

from django.conf.urls.static import static


urlpatterns = [
    path('getQuestions/',views.get_initial_questions, name="getQuestions"),
    path('getDailyContent/',views.get_daily_content,name="getDailyContent")
    
   


]