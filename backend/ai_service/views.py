"""
AI Service views for generating explanations.
Rate limited to prevent abuse (OWASP).
"""
from rest_framework import status
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
import bleach

from .gemini import gemini_service
from reactions.models import Reaction
from elements.models import Element


class AIExplanationThrottle(AnonRateThrottle):
    """
    Custom throttle for AI explanation endpoints.
    More restrictive than general API throttle.
    """
    rate = '10/minute'


@api_view(['POST'])
@throttle_classes([AIExplanationThrottle])
def explain_reaction(request):
    """
    Generate AI explanation for a validated reaction.
    
    POST /api/ai/explain-reaction/
    Body: {"reaction_id": 1}
    
    Rate limited to 10 requests per minute.
    """
    reaction_id = request.data.get('reaction_id')
    
    if not reaction_id:
        return Response({
            'success': False,
            'error': 'Se requiere reaction_id'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        reaction = Reaction.objects.get(pk=reaction_id, is_verified=True)
    except Reaction.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Reacción no encontrada o no verificada.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Build context from the reaction
    context = {
        'type': reaction.get_reaction_type_display(),
        'energy': reaction.get_energy_change_display(),
        'difficulty': reaction.difficulty_level,
        'educational_notes': reaction.educational_notes,
    }
    
    try:
        # Try Ollama first, then Gemini AI, fallback to Local AI templates
        from .ollama_service import ollama_service
        from .local_service import local_ai
        
        result = {'success': False}
        
        # 1. Try Ollama (local LLM) first
        if ollama_service.is_available():
            result = ollama_service.explain_reaction(reaction)
        
        # 2. If Ollama failed, try Gemini API
        if not result.get('success') and gemini_service.is_available():
            result = gemini_service.explain_reaction(reaction.equation, context)
        
        # 3. If both failed, use Local AI templates
        if not result.get('success'):
            result = local_ai.explain_reaction(reaction)
        
        # Ensure we always have an explanation (never None)
        explanation = result.get('explanation') or result.get('fallback') or 'No hay explicación disponible.'
        
        return Response({
            'success': True,
            'reaction': {
                'id': reaction.id,
                'name': reaction.name,
                'equation': reaction.equation,
            },
            'explanation': explanation,
            'source': result.get('source', 'local'),
            'error': None
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"AI explain_reaction error: {str(e)}")
        
        # Fallback to local AI on crash
        from .local_service import local_ai
        result = local_ai.explain_reaction(reaction)
        
        # Ensure we always have an explanation (never None)
        explanation = result.get('explanation') or result.get('fallback') or 'No hay explicación disponible.'
        
        return Response({
            'success': True,
            'reaction': {
                'id': reaction.id,
                'name': reaction.name,
                'equation': reaction.equation,
            },
            'explanation': explanation,
            'source': 'local_fallback',
            'error': None
        })


@api_view(['POST'])
@throttle_classes([AIExplanationThrottle])
def explain_element(request):
    """
    Generate AI explanation for a chemical element.
    
    POST /api/ai/explain-element/
    Body: {"symbol": "H"} or {"atomic_number": 1}
    
    Rate limited to 10 requests per minute.
    """
    symbol = request.data.get('symbol')
    atomic_number = request.data.get('atomic_number')
    
    if not symbol and not atomic_number:
        return Response({
            'success': False,
            'error': 'Se requiere symbol o atomic_number'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if symbol:
            # Sanitize input
            symbol = bleach.clean(str(symbol).strip().upper())
            element = Element.objects.get(symbol=symbol)
        else:
            element = Element.objects.get(pk=atomic_number)
    except Element.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Elemento no encontrado.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Build element data dict - handle optional fields
        element_data = {
            'atomic_number': element.atomic_number,
            'symbol': element.symbol,
            'name_es': getattr(element, 'name_es', element.symbol),
            'category': element.category,
            'description': getattr(element, 'description', '') or '',
        }
        
        # Try Ollama first, then Gemini AI, fallback to Local AI templates
        from .ollama_service import ollama_service
        from .local_service import local_ai
        
        result = {'success': False}
        
        # 1. Try Ollama (local LLM) first
        if ollama_service.is_available():
            result = ollama_service.explain_element(element_data)
        
        # 2. If Ollama failed, try Gemini API
        if not result.get('success') and gemini_service.is_available():
            result = gemini_service.explain_element(element_data)
        
        # 3. If both failed, use Local AI templates
        if not result.get('success'):
            result = local_ai.explain_element(element_data)
        
        # Ensure we always have an explanation (never None)
        explanation = result.get('explanation') or result.get('fallback') or 'No hay explicación disponible.'
        
        return Response({
            'success': True,
            'element': {
                'atomic_number': element.atomic_number,
                'symbol': element.symbol,
                'name_es': getattr(element, 'name_es', element.symbol),
            },
            'explanation': explanation,
            'source': result.get('source', 'local'),
            'error': None
        })
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"AI explain_element error: {str(e)}")
        
        # Last resort fallback to local AI
        from .local_service import local_ai
        result = local_ai.explain_element({
            'symbol': element.symbol,
            'atomic_number': element.atomic_number,
            'name_es': getattr(element, 'name_es', element.symbol),
            'category': element.category,
            'description': getattr(element, 'description', '')
        })
        
        # Ensure we always have an explanation (never None)
        explanation = result.get('explanation') or result.get('fallback') or 'No hay explicación disponible.'
        
        return Response({
            'success': True,
            'element': {
                'atomic_number': element.atomic_number,
                'symbol': element.symbol,
                'name_es': getattr(element, 'name_es', element.symbol),
            },
            'explanation': explanation,
            'source': 'local_fallback',
            'error': None
        })


@api_view(['GET'])
def ai_status(request):
    """
    Check if AI service is available.
    GET /api/ai/status/
    """
    return Response({
        'success': True,
        'available': gemini_service.is_available(),
        'service': 'gemini'
    })
