from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.db.models import Q

from elements.models import Element
from reactions.models import Reaction
from .serializers import (
    ElementSerializer, ElementListSerializer,
    ReactionSerializer, ReactionListSerializer,
    ReactionValidationSerializer, ExplanationRequestSerializer
)
from ai_service.service import DeepSeekService


class AIRateThrottle(AnonRateThrottle):
    """Rate limiter específico para llamadas a IA."""
    rate = '10/minute'


class ElementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API ViewSet para elementos químicos.
    
    Endpoints:
    - GET /api/elements/ - Lista todos los elementos
    - GET /api/elements/{symbol}/ - Detalle de un elemento
    - GET /api/elements/by_category/?category=alkali-metal - Filtrar por categoría
    """
    queryset = Element.objects.all()
    lookup_field = 'symbol'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ElementListSerializer
        return ElementSerializer
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Filtra elementos por categoría."""
        category = request.query_params.get('category', None)
        if not category:
            return Response(
                {'error': 'Parámetro "category" requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        elements = self.queryset.filter(category=category)
        serializer = ElementListSerializer(elements, many=True)
        return Response({'elements': serializer.data})
    
    @action(detail=False, methods=['get'])
    def periodic_table(self, request):
        """Retorna todos los elementos organizados para la tabla periódica."""
        elements = self.queryset.all()
        serializer = ElementListSerializer(elements, many=True)
        
        # Organizar por período y grupo
        table = {}
        for elem in serializer.data:
            period = elem['period']
            group = elem['group']
            if period not in table:
                table[period] = {}
            table[period][group] = elem
        
        return Response({
            'elements': serializer.data,
            'organized': table
        })
    
    @action(detail=False, methods=['post'], throttle_classes=[AIRateThrottle])
    def explain(self, request):
        """
        Genera explicación científica detallada de un elemento usando IA.
        
        Request body: {"symbol": "Fe", "level": "intermediate"}
        """
        symbol = request.data.get('symbol')
        level = request.data.get('level', 'intermediate')
        
        if not symbol:
            return Response(
                {'error': 'Parámetro "symbol" requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            element = Element.objects.get(symbol__iexact=symbol)
        except Element.DoesNotExist:
            return Response(
                {'error': f'Elemento "{symbol}" no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generar explicación con IA
        from ai_service.service import DeepSeekService
        ai_service = DeepSeekService()
        
        try:
            explanation = ai_service.explain_element(element, level)
            return Response({
                'success': True,
                'element': ElementSerializer(element).data,
                'explanation': explanation,
                'level': level
            })
        except Exception as e:
            # Fallback a descripción básica
            fallback = f"""
{element.name} ({element.symbol}) es un elemento químico con número atómico {element.atomic_number}.

Características principales:
- Masa atómica: {element.atomic_mass} u
- Categoría: {element.category}
- Configuración electrónica: {element.electron_config}
- Electronegatividad: {element.electronegativity or 'N/A'}
- Electrones de valencia: {element.valence_electrons}

Este elemento se encuentra en el período {element.period} y grupo {element.group} de la tabla periódica.
            """.strip()
            
            return Response({
                'success': True,
                'element': ElementSerializer(element).data,
                'explanation': fallback,
                'level': level,
                'note': 'Explicación generada localmente (IA no disponible)'
            })


class ReactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API ViewSet para reacciones químicas.
    
    Endpoints:
    - GET /api/reactions/ - Lista reacciones
    - GET /api/reactions/{id}/ - Detalle de reacción
    - POST /api/reactions/validate/ - Validar combinación de elementos
    - POST /api/reactions/explain/ - Obtener explicación IA
    """
    queryset = Reaction.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReactionListSerializer
        return ReactionSerializer
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """
        Valida si existe una reacción entre los elementos dados.
        Si no hay coincidencia exacta, devuelve sugerencias.
        
        Request body: {"elements": ["Na", "Cl"]}
        """
        serializer = ReactionValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        elements = serializer.validated_data['elements']
        
        # Buscar reacciones que contengan estos elementos
        reactions = self.find_reactions_for_elements(elements)
        
        if not reactions:
            # Buscar sugerencias de reacciones con al menos uno de los elementos
            suggestions = self.find_suggestions_for_elements(elements)
            suggestion_serializer = ReactionListSerializer(suggestions, many=True)
            
            return Response({
                'success': True,
                'found': False,
                'message': f'No se encontró una reacción directa entre {", ".join(elements)}',
                'elements': elements,
                'reactions': [],
                'suggestions': suggestion_serializer.data,
                'suggestion_message': f'Prueba con estas combinaciones que incluyen {"alguno de los elementos seleccionados" if len(elements) > 1 else elements[0]}:'
            })
        
        reaction_serializer = ReactionSerializer(reactions, many=True)
        return Response({
            'success': True,
            'found': True,
            'message': f'Se encontraron {len(reactions)} reacción(es)',
            'elements': elements,
            'reactions': reaction_serializer.data
        })
    
    def find_reactions_for_elements(self, elements):
        """
        Busca reacciones que involucren los elementos dados.
        Busca directamente en el campo JSON reactants.
        """
        all_reactions = Reaction.objects.all()
        valid_reactions = []
        partial_reactions = []
        
        for reaction in all_reactions:
            # Obtener símbolos de la reacción
            reaction_symbols = set()
            for reactant in reaction.reactants:
                if 'symbol' in reactant:
                    reaction_symbols.add(reactant['symbol'])
                if 'elements' in reactant:
                    reaction_symbols.update(reactant['elements'])
            
            # Verificar si hay coincidencia con los elementos seleccionados
            input_symbols = set(elements)
            
            # Coincidencia exacta: los elementos de entrada son exactamente los reactantes
            if input_symbols == reaction_symbols:
                valid_reactions.append(reaction)
            # Coincidencia de subconjunto: los elementos de entrada están en la reacción
            elif input_symbols.issubset(reaction_symbols):
                partial_reactions.append(reaction)
            # Para un solo elemento, buscar reacciones donde ese elemento participe
            elif len(input_symbols) == 1 and input_symbols.intersection(reaction_symbols):
                partial_reactions.append(reaction)
        
        # Retornar reacciones exactas primero, luego parciales
        return valid_reactions if valid_reactions else partial_reactions[:5]
    
    def find_suggestions_for_elements(self, elements):
        """
        Busca reacciones que contengan AL MENOS UNO de los elementos dados.
        Devuelve hasta 5 sugerencias ordenadas por relevancia.
        """
        all_reactions = Reaction.objects.all()
        suggestions = []
        
        for reaction in all_reactions:
            reaction_symbols = set()
            for reactant in reaction.reactants:
                if 'symbol' in reactant:
                    reaction_symbols.add(reactant['symbol'])
                if 'elements' in reactant:
                    reaction_symbols.update(reactant['elements'])
            
            # Contar cuántos elementos coinciden
            input_symbols = set(elements)
            matching = input_symbols.intersection(reaction_symbols)
            
            if matching:
                suggestions.append({
                    'reaction': reaction,
                    'match_count': len(matching),
                    'required_elements': list(reaction_symbols - input_symbols)
                })
        
        # Ordenar por cantidad de coincidencias (más coincidencias primero)
        suggestions.sort(key=lambda x: x['match_count'], reverse=True)
        
        # Retornar solo las reacciones
        return [s['reaction'] for s in suggestions[:8]]
    
    @action(detail=False, methods=['post'], throttle_classes=[AIRateThrottle])
    def explain(self, request):
        """
        Genera explicación científica de una reacción usando DeepSeek.
        
        Request body: {"reaction_id": 1, "level": "intermediate"}
        """
        serializer = ExplanationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reaction_id = serializer.validated_data['reaction_id']
        level = serializer.validated_data['level']
        
        # Obtener reacción
        reaction = Reaction.objects.get(id=reaction_id)
        
        # Llamar a DeepSeek
        try:
            ai_service = DeepSeekService()
            explanation = ai_service.explain_reaction(reaction, level)
            
            return Response({
                'success': True,
                'reaction_id': reaction_id,
                'level': level,
                'explanation': explanation
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Error al generar explicación: {str(e)}',
                'fallback_description': reaction.description
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Filtra reacciones por tipo."""
        reaction_type = request.query_params.get('type', None)
        if not reaction_type:
            return Response(
                {'error': 'Parámetro "type" requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reactions = self.queryset.filter(reaction_type=reaction_type)
        serializer = ReactionListSerializer(reactions, many=True)
        return Response({'reactions': serializer.data})
