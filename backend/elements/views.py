"""
API Views for Elements app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Element
from .serializers import (
    ElementListSerializer,
    ElementDetailSerializer,
    Element3DDataSerializer,
)


class ElementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing chemical elements.
    
    list: Returns all elements (lightweight data for periodic table)
    retrieve: Returns full element details by atomic number or symbol
    """
    
    queryset = Element.objects.all()
    lookup_field = 'pk'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ElementListSerializer
        elif self.action == 'retrieve_by_symbol':
            return ElementDetailSerializer
        elif self.action == 'visualization_data':
            return Element3DDataSerializer
        return ElementDetailSerializer
    
    @action(detail=False, methods=['get'], url_path='symbol/(?P<symbol>[A-Za-z]{1,3})')
    def retrieve_by_symbol(self, request, symbol=None):
        """
        Retrieve element by its chemical symbol.
        GET /api/elements/symbol/H/
        """
        try:
            element = Element.objects.get(symbol__iexact=symbol)
            serializer = ElementDetailSerializer(element)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Element.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'error': f"Elemento con símbolo '{symbol}' no encontrado."
                },
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='category/(?P<category>[a-z-]+)')
    def by_category(self, request, category=None):
        """
        Get all elements of a specific category.
        GET /api/elements/category/noble-gas/
        """
        elements = Element.objects.filter(category=category)
        if not elements.exists():
            return Response(
                {
                    'success': False,
                    'error': f"Categoría '{category}' no encontrada o sin elementos."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ElementListSerializer(elements, many=True)
        return Response({
            'success': True,
            'count': elements.count(),
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='3d-data')
    def visualization_data(self, request):
        """
        Get optimized 3D visualization data for all elements.
        GET /api/elements/3d-data/
        """
        elements = Element.objects.all()
        serializer = Element3DDataSerializer(elements, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['get'], url_path='periodic-table')
    def periodic_table(self, request):
        """
        Get elements organized for periodic table rendering.
        GET /api/elements/periodic-table/
        """
        elements = Element.objects.all().values(
            'atomic_number', 'symbol', 'name_es', 'category',
            'atomic_mass', 'group', 'period', 'block', 'color_hex'
        )
        
        # Organize by period and group for easy rendering
        table = {}
        for element in elements:
            period = element['period']
            if period not in table:
                table[period] = []
            table[period].append(element)
        
        return Response({
            'success': True,
            'data': table
        })
