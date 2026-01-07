from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ElementViewSet, ReactionViewSet

router = DefaultRouter()
router.register(r'elements', ElementViewSet)
router.register(r'reactions', ReactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
