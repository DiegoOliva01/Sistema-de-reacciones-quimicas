"""
API Views for Reactions app.
Includes reaction validation and search functionality.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
import logging

from .models import Reaction, ReactionElement, Molecule
from .serializers import (
    ReactionListSerializer,
    ReactionDetailSerializer,
    Reaction3DSerializer,
    ReactionValidationSerializer,
    MoleculeSerializer,
)
from elements.models import Element

logger = logging.getLogger(__name__)


class ReactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and searching chemical reactions.
    """
    
    queryset = Reaction.objects.filter(is_verified=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReactionListSerializer
        elif self.action == 'animation':
            return Reaction3DSerializer
        return ReactionDetailSerializer
    
    def list(self, request, *args, **kwargs):
        """List all verified reactions."""
        queryset = self.get_queryset()
        
        # Optional filtering
        reaction_type = request.query_params.get('type')
        difficulty = request.query_params.get('difficulty')
        
        if reaction_type:
            queryset = queryset.filter(reaction_type=reaction_type)
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """Get detailed reaction information."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def animation(self, request, pk=None):
        """
        Get 3D animation data for a specific reaction.
        GET /api/reactions/{id}/animation/
        """
        reaction = self.get_object()
        serializer = Reaction3DSerializer(reaction)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """
        Validate if selected elements can form a reaction.
        POST /api/reactions/validate/
        Body: {"element_symbols": ["H", "O"]}
        
        Returns matching reactions or message if no reaction exists.
        """
        serializer = ReactionValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        symbols = serializer.validated_data['element_symbols']
        
        # Find elements
        elements = Element.objects.filter(symbol__in=symbols)
        element_ids = list(elements.values_list('atomic_number', flat=True))
        
        if len(element_ids) != len(symbols):
            return Response({
                'success': False,
                'found': False,
                'message': 'Algunos elementos no fueron encontrados en la base de datos.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Search for reactions containing ALL selected elements as reactants
        reactions = self._find_reactions_with_elements(element_ids)
        
        if reactions.exists():
            reaction_serializer = ReactionListSerializer(reactions, many=True)
            return Response({
                'success': True,
                'found': True,
                'count': reactions.count(),
                'reactions': reaction_serializer.data,
                'message': f'Se encontraron {reactions.count()} reacción(es) posible(s).'
            })
        
        # No direct reactions found - provide helpful feedback
        suggestions = self._get_reaction_suggestions(symbols)
        
        return Response({
            'success': True,
            'found': False,
            'reactions': [],
            'message': self._get_no_reaction_message(symbols),
            'suggestions': suggestions
        })
    
    def _find_reactions_with_elements(self, element_ids):
        """
        Find reactions where ALL given elements are reactants.
        """
        # Find reactions that have ALL the elements as reactants
        reactions = Reaction.objects.filter(is_verified=True)
        
        for element_id in element_ids:
            reactions = reactions.filter(
                reaction_elements__element_id=element_id,
                reaction_elements__role='reactant'
            )
        
        return reactions.distinct()
    
    def _get_reaction_suggestions(self, symbols):
        """
        Get suggestions for elements that could complete a reaction.
        """
        suggestions = []
        
        # Look for reactions that include at least one of the selected elements
        elements = Element.objects.filter(symbol__in=symbols)
        
        for element in elements:
            related_reactions = ReactionElement.objects.filter(
                element=element,
                role='reactant'
            ).select_related('reaction')
            
            for re in related_reactions[:3]:
                other_elements = re.reaction.reaction_elements.filter(
                    role='reactant'
                ).exclude(element=element)
                
                for other in other_elements:
                    if other.element.symbol not in symbols:
                        suggestion = f"Prueba agregar {other.element.symbol} ({other.element.name_es})"
                        if suggestion not in suggestions:
                            suggestions.append(suggestion)
        
        return suggestions[:5]
    
    def _get_no_reaction_message(self, symbols):
        """
        Generate a helpful message when no reaction is found.
        """
        symbols_str = ', '.join(symbols)
        
        # Check for common "non-reactive" combinations
        noble_gases = {'He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'}
        selected_nobles = set(symbols) & noble_gases
        
        if selected_nobles:
            return (
                f"Los elementos {symbols_str} no forman una reacción conocida. "
                f"Nota: {', '.join(selected_nobles)} es/son gas(es) noble(s) y "
                "generalmente no reaccionan debido a su configuración electrónica estable."
            )
        
        return (
            f"No se encontró una reacción conocida entre {symbols_str}. "
            "Esto puede deberse a que estos elementos no reaccionan entre sí "
            "bajo condiciones normales, o la reacción no está en nuestra base de datos. "
            "Prueba con una combinación diferente."
        )
    
    @action(detail=False, methods=['get'], url_path='by-type/(?P<reaction_type>[a-z_]+)')
    def by_type(self, request, reaction_type=None):
        """
        Get all reactions of a specific type.
        GET /api/reactions/by-type/synthesis/
        """
        reactions = Reaction.objects.filter(
            is_verified=True,
            reaction_type=reaction_type
        )
        
        if not reactions.exists():
            return Response({
                'success': False,
                'error': f"No se encontraron reacciones de tipo '{reaction_type}'."
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ReactionListSerializer(reactions, many=True)
        return Response({
            'success': True,
            'count': reactions.count(),
            'data': serializer.data
        })


class MoleculeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing molecules.
    Used for quick lookup of common molecule structures.
    """
    
    queryset = Molecule.objects.all()
    serializer_class = MoleculeSerializer
    lookup_field = 'formula'
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Search molecules by formula or name.
        GET /api/molecules/search/?q=water
        """
        query = request.query_params.get('q', '')
        
        if len(query) < 2:
            return Response({
                'success': False,
                'error': 'La búsqueda debe tener al menos 2 caracteres.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        molecules = Molecule.objects.filter(
            Q(formula__icontains=query) |
            Q(name__icontains=query) |
            Q(name_es__icontains=query)
        )
        
        serializer = MoleculeSerializer(molecules, many=True)
        return Response({
            'success': True,
            'count': molecules.count(),
            'data': serializer.data
        })
