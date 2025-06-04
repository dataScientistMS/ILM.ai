from django.urls import path 
from . import views
from django.conf import settings

from django.conf.urls.static import static


urlpatterns = [
    path('sendUserInput/',views.sendUserInput, name="user-input"),
    
    path('messages/<int:chat_id>/', views.getMessageByChat, name='messages-by-chat'),

    path('messages/<int:chat_id>/insert', views.sendMessage, name='send-messages-by-chat'),

    path('ilmAI/insert/', views.ilmAI, name='ask-ilmAI'),
    
    path('ilmAI-interactive/insert/', views.ilmAI_interactive, name='ask-ilmAI-interactive'),


]



