"""
Core URL Configuration
Sistema de Reacciones Químicas API
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    """API root endpoint with documentation."""
    return JsonResponse({
        'success': True,
        'message': 'Sistema de Reacciones Químicas API',
        'version': '1.0.0',
        'endpoints': {
            'elements': '/api/elements/',
            'reactions': '/api/reactions/',
            'molecules': '/api/molecules/',
            'ai': '/api/ai/',
        },
        'documentation': '/api/docs/',
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API root
    path('api/', api_root, name='api_root'),
    
    # API endpoints
    path('api/elements/', include('elements.urls')),
    path('api/', include('reactions.urls')),
    path('api/ai/', include('ai_service.urls')),
]
