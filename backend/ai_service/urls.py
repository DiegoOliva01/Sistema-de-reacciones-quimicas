from django.urls import path
from . import views

app_name = 'ai_service'

urlpatterns = [
    path('explain-reaction/', views.explain_reaction, name='explain_reaction'),
    path('explain-element/', views.explain_element, name='explain_element'),
    path('status/', views.ai_status, name='status'),
]
