from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'reactions'

router = DefaultRouter()
router.register(r'reactions', views.ReactionViewSet, basename='reaction')
router.register(r'molecules', views.MoleculeViewSet, basename='molecule')

urlpatterns = [
    path('', include(router.urls)),
]
