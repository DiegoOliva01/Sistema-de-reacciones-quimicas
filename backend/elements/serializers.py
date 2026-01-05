"""
API Serializers for Elements app.
Includes input validation and sanitization (OWASP A03).
"""
from rest_framework import serializers
import bleach

from .models import Element


class ElementListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for periodic table display.
    Returns minimal data needed for the interactive table.
    """
    
    class Meta:
        model = Element
        fields = [
            'atomic_number',
            'symbol',
            'name_es',
            'category',
            'atomic_mass',
            'group',
            'period',
            'block',
            'color_hex',
        ]


class ElementDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for element detail view.
    Includes all properties for education and 3D visualization.
    """
    
    valence_electrons = serializers.ReadOnlyField()
    oxidation_states_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Element
        fields = '__all__'
    
    def get_oxidation_states_list(self, obj):
        """Return oxidation states as a list of integers."""
        return obj.get_common_oxidation_states()


class ElementSelectionSerializer(serializers.Serializer):
    """
    Serializer for validating element selection input.
    Used when user selects elements to check for possible reactions.
    """
    
    symbols = serializers.ListField(
        child=serializers.CharField(max_length=3),
        min_length=2,
        max_length=10,
        help_text="Lista de símbolos de elementos seleccionados"
    )
    
    def validate_symbols(self, value):
        """
        Validate and sanitize element symbols.
        - Sanitize input (OWASP A03)
        - Check elements exist
        - Remove duplicates
        """
        # Sanitize each symbol
        sanitized = [bleach.clean(s.strip().upper()) for s in value]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_symbols = []
        for symbol in sanitized:
            if symbol not in seen:
                seen.add(symbol)
                unique_symbols.append(symbol)
        
        # Validate elements exist
        existing = set(Element.objects.filter(
            symbol__in=unique_symbols
        ).values_list('symbol', flat=True))
        
        invalid = set(unique_symbols) - existing
        if invalid:
            raise serializers.ValidationError(
                f"Elementos no encontrados: {', '.join(invalid)}"
            )
        
        return unique_symbols


class Element3DDataSerializer(serializers.ModelSerializer):
    """
    Serializer for 3D visualization data only.
    Optimized for Three.js rendering.
    """
    
    class Meta:
        model = Element
        fields = [
            'atomic_number',
            'symbol',
            'name_es',
            'cpk_color',
            'atomic_radius',
            'covalent_radius',
            'electronegativity',
        ]
