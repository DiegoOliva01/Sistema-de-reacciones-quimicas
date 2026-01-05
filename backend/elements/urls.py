from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'elements'

router = DefaultRouter()
router.register(r'', views.ElementViewSet, basename='element')

urlpatterns = [
    path('', include(router.urls)),
]
