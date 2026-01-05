"""
API Serializers for Reactions app.
"""
from rest_framework import serializers
import bleach

from .models import Reaction, ReactionElement, Molecule
from elements.serializers import ElementListSerializer


class ReactionElementSerializer(serializers.ModelSerializer):
    """Serializer for elements within a reaction."""
    
    element = ElementListSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = ReactionElement
        fields = [
            'element',
            'role',
            'role_display',
            'coefficient',
            'oxidation_state',
        ]


class MoleculeSerializer(serializers.ModelSerializer):
    """Serializer for molecules."""
    
    class Meta:
        model = Molecule
        fields = [
            'id',
            'formula',
            'name',
            'name_es',
            'structure_3d',
            'molecular_weight',
            'is_polar',
            'state_at_room_temp',
        ]


class ReactionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for reaction listing.
    """
    
    reaction_type_display = serializers.CharField(
        source='get_reaction_type_display', 
        read_only=True
    )
    energy_change_display = serializers.CharField(
        source='get_energy_change_display',
        read_only=True
    )
    difficulty_display = serializers.CharField(
        source='get_difficulty_level_display',
        read_only=True
    )
    
    class Meta:
        model = Reaction
        fields = [
            'id',
            'name',
            'equation',
            'reaction_type',
            'reaction_type_display',
            'energy_change',
            'energy_change_display',
            'is_reversible',
            'difficulty_level',
            'difficulty_display',
        ]


class ReactionDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for reaction detail view.
    Includes all data for education and 3D visualization.
    """
    
    reaction_elements = ReactionElementSerializer(many=True, read_only=True)
    reaction_type_display = serializers.CharField(
        source='get_reaction_type_display', 
        read_only=True
    )
    energy_change_display = serializers.CharField(
        source='get_energy_change_display',
        read_only=True
    )
    difficulty_display = serializers.CharField(
        source='get_difficulty_level_display',
        read_only=True
    )
    
    class Meta:
        model = Reaction
        fields = [
            'id',
            'name',
            'equation',
            'equation_balanced',
            'reaction_type',
            'reaction_type_display',
            'is_reversible',
            'energy_change',
            'energy_change_display',
            'enthalpy_change',
            'activation_energy',
            'requires_catalyst',
            'catalyst',
            'temperature_range',
            'pressure_conditions',
            'animation_data',
            'difficulty_level',
            'difficulty_display',
            'educational_notes',
            'real_world_examples',
            'safety_warnings',
            'is_verified',
            'reaction_elements',
        ]


class Reaction3DSerializer(serializers.ModelSerializer):
    """
    Serializer optimized for 3D animation data.
    Returns only data needed for Three.js rendering.
    """
    
    reaction_elements = ReactionElementSerializer(many=True, read_only=True)
    
    class Meta:
        model = Reaction
        fields = [
            'id',
            'equation',
            'animation_data',
            'energy_change',
            'reaction_elements',
        ]


class ReactionValidationSerializer(serializers.Serializer):
    """
    Serializer for validating if elements can react.
    Input validation and sanitization (OWASP A03).
    """
    
    element_symbols = serializers.ListField(
        child=serializers.CharField(max_length=3),
        min_length=2,
        max_length=10,
        help_text="Símbolos de elementos a validar"
    )
    
    def validate_element_symbols(self, value):
        """Sanitize and validate element symbols."""
        # Sanitize input
        sanitized = [bleach.clean(s.strip().upper()) for s in value]
        
        # Remove empty strings
        sanitized = [s for s in sanitized if s]
        
        if len(sanitized) < 2:
            raise serializers.ValidationError(
                "Se requieren al menos 2 elementos para buscar una reacción."
            )
        
        return sanitized


class ReactionSearchResultSerializer(serializers.Serializer):
    """
    Serializer for reaction search results.
    Returns found reactions or a "no reaction" message.
    """
    
    found = serializers.BooleanField()
    reactions = ReactionListSerializer(many=True, required=False)
    message = serializers.CharField(required=False)
    suggestions = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Sugerencias de elementos adicionales"
    )
