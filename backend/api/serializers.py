from rest_framework import serializers
from elements.models import Element
from reactions.models import Reaction, ReactionElement


class ElementSerializer(serializers.ModelSerializer):
    """Serializer completo para Element."""
    electron_shells = serializers.SerializerMethodField()
    
    class Meta:
        model = Element
        fields = [
            'id', 'symbol', 'name', 'name_en', 'atomic_number', 'atomic_mass',
            'category', 'electron_config', 'electrons_per_shell', 'valence_electrons',
            'electronegativity', 'ionization_energy', 'electron_affinity',
            'density', 'melting_point', 'boiling_point',
            'period', 'group', 'color_hex', 'electron_shells'
        ]
    
    def get_electron_shells(self, obj):
        return obj.get_electron_shells()


class ElementListSerializer(serializers.ModelSerializer):
    """Serializer reducido para lista de elementos (tabla periódica)."""
    
    class Meta:
        model = Element
        fields = [
            'id', 'symbol', 'name', 'atomic_number', 'atomic_mass',
            'category', 'period', 'group', 'color_hex', 'valence_electrons'
        ]


class ReactionSerializer(serializers.ModelSerializer):
    """Serializer completo para Reaction."""
    element_symbols = serializers.SerializerMethodField()
    
    class Meta:
        model = Reaction
        fields = [
            'id', 'equation', 'equation_html', 'reaction_type', 'difficulty_level',
            'reactants', 'products', 'conditions',
            'enthalpy_change', 'is_exothermic',
            'animation_data', 'description', 'real_world_applications',
            'element_symbols'
        ]
    
    def get_element_symbols(self, obj):
        return obj.get_element_symbols()


class ReactionListSerializer(serializers.ModelSerializer):
    """Serializer reducido para lista de reacciones."""
    
    class Meta:
        model = Reaction
        fields = [
            'id', 'equation', 'reaction_type', 'difficulty_level', 'is_exothermic',
            'reactants', 'description'
        ]


class ReactionValidationSerializer(serializers.Serializer):
    """Serializer para validar combinación de elementos."""
    elements = serializers.ListField(
        child=serializers.CharField(max_length=3),
        min_length=1,
        max_length=5,
        help_text="Lista de símbolos de elementos (ej: ['Na', 'Cl'])"
    )
    
    def validate_elements(self, value):
        """Valida que los elementos existan."""
        # Convertir a mayúsculas y validar
        symbols = [s.strip().capitalize() for s in value]
        
        # Verificar que existan en la base de datos
        existing = Element.objects.filter(symbol__in=symbols).values_list('symbol', flat=True)
        existing_set = set(existing)
        
        invalid = [s for s in symbols if s not in existing_set]
        if invalid:
            raise serializers.ValidationError(
                f"Elementos no encontrados: {', '.join(invalid)}"
            )
        
        return symbols


class ExplanationRequestSerializer(serializers.Serializer):
    """Serializer para solicitar explicación de reacción."""
    reaction_id = serializers.IntegerField()
    level = serializers.ChoiceField(
        choices=['basic', 'intermediate', 'advanced'],
        default='intermediate'
    )
    
    def validate_reaction_id(self, value):
        """Valida que la reacción exista."""
        if not Reaction.objects.filter(id=value).exists():
            raise serializers.ValidationError("Reacción no encontrada")
        return value
