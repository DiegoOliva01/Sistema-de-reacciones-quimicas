"""
Reaction models - Represents chemical reactions and their relationships with elements.
"""
from django.db import models


class Reaction(models.Model):
    """
    Model representing a chemical reaction.
    Contains all data needed for:
    - Validation of element combinations
    - 3D animation rendering
    - Educational explanations
    """
    
    REACTION_TYPES = [
        ('synthesis', 'Síntesis'),
        ('decomposition', 'Descomposición'),
        ('single_replacement', 'Sustitución Simple'),
        ('double_replacement', 'Sustitución Doble'),
        ('combustion', 'Combustión'),
        ('redox', 'Oxidación-Reducción'),
        ('acid_base', 'Ácido-Base'),
        ('precipitation', 'Precipitación'),
        ('complexation', 'Complejación'),
        ('organic', 'Reacción Orgánica'),
    ]
    
    ENERGY_TYPES = [
        ('exothermic', 'Exotérmica'),
        ('endothermic', 'Endotérmica'),
        ('neutral', 'Neutral'),
    ]
    
    DIFFICULTY_LEVELS = [
        (1, 'Básico'),
        (2, 'Intermedio'),
        (3, 'Avanzado'),
        (4, 'Universitario'),
        (5, 'Profesional'),
    ]
    
    # Basic identification
    name = models.CharField(max_length=200, verbose_name="Nombre de la reacción")
    equation = models.CharField(
        max_length=500, 
        verbose_name="Ecuación química",
        help_text="Ej: 2H2 + O2 → 2H2O"
    )
    equation_balanced = models.BooleanField(default=True, help_text="Si la ecuación está balanceada")
    
    # Classification
    reaction_type = models.CharField(
        max_length=20, 
        choices=REACTION_TYPES,
        db_index=True
    )
    is_reversible = models.BooleanField(default=False, verbose_name="Es reversible")
    
    # Thermodynamics
    energy_change = models.CharField(
        max_length=20, 
        choices=ENERGY_TYPES,
        default='neutral'
    )
    enthalpy_change = models.FloatField(
        null=True, 
        blank=True, 
        help_text="ΔH en kJ/mol"
    )
    activation_energy = models.FloatField(
        null=True, 
        blank=True, 
        help_text="Energía de activación en kJ/mol"
    )
    
    # Conditions
    requires_catalyst = models.BooleanField(default=False)
    catalyst = models.CharField(max_length=100, blank=True)
    temperature_range = models.CharField(
        max_length=50, 
        blank=True, 
        help_text="Rango de temperatura en °C"
    )
    pressure_conditions = models.CharField(max_length=50, blank=True)
    
    # 3D Animation Data (JSONB)
    animation_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="""
        Structure:
        {
            "reactants": [
                {"molecule": "H2", "count": 2, "atoms": [{"element": "H", "position": [0,0,0]}]}
            ],
            "products": [
                {"molecule": "H2O", "count": 2, "atoms": [...]}
            ],
            "bond_changes": [
                {"type": "break", "from": [0,1], "step": 1},
                {"type": "form", "atoms": [0,2], "step": 2}
            ],
            "animation_steps": [
                {"step": 1, "duration_ms": 1000, "description": "Ruptura de enlaces H-H"}
            ],
            "total_duration_ms": 5000
        }
        """
    )
    
    # Educational metadata
    difficulty_level = models.PositiveIntegerField(
        choices=DIFFICULTY_LEVELS,
        default=1
    )
    educational_notes = models.TextField(
        blank=True, 
        verbose_name="Notas educativas",
        help_text="Explicación básica para mostrar antes de la IA"
    )
    real_world_examples = models.TextField(
        blank=True,
        verbose_name="Ejemplos del mundo real"
    )
    safety_warnings = models.TextField(
        blank=True,
        verbose_name="Advertencias de seguridad"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(
        default=False, 
        help_text="Verificado por un químico"
    )
    
    class Meta:
        ordering = ['name']
        verbose_name = "Reacción"
        verbose_name_plural = "Reacciones"
        indexes = [
            models.Index(fields=['reaction_type']),
            models.Index(fields=['difficulty_level']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"{self.name}: {self.equation}"
    
    def get_reactant_elements(self):
        """Get all elements that are reactants in this reaction."""
        return self.reactionelement_set.filter(role='reactant')
    
    def get_product_elements(self):
        """Get all elements that are products in this reaction."""
        return self.reactionelement_set.filter(role='product')


class ReactionElement(models.Model):
    """
    Junction table connecting reactions with elements.
    Tracks which elements participate and their role.
    """
    
    ROLE_CHOICES = [
        ('reactant', 'Reactivo'),
        ('product', 'Producto'),
        ('catalyst', 'Catalizador'),
    ]
    
    reaction = models.ForeignKey(
        Reaction, 
        on_delete=models.CASCADE,
        related_name='reaction_elements'
    )
    element = models.ForeignKey(
        'elements.Element', 
        on_delete=models.CASCADE,
        related_name='element_reactions'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    coefficient = models.PositiveIntegerField(
        default=1, 
        help_text="Coeficiente estequiométrico"
    )
    oxidation_state = models.IntegerField(
        null=True, 
        blank=True,
        help_text="Estado de oxidación en esta reacción"
    )
    
    class Meta:
        verbose_name = "Elemento en reacción"
        verbose_name_plural = "Elementos en reacciones"
        # Ensure unique combination of reaction, element, and role
        unique_together = ['reaction', 'element', 'role']
    
    def __str__(self):
        return f"{self.coefficient}{self.element.symbol} ({self.get_role_display()})"


class Molecule(models.Model):
    """
    Model representing common molecules for quick lookup and 3D visualization.
    """
    
    formula = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    name_es = models.CharField(max_length=100, verbose_name="Nombre en español")
    
    # 3D visualization data
    structure_3d = models.JSONField(
        default=dict,
        help_text="""
        {
            "atoms": [
                {"element": "H", "position": [0, 0, 0]},
                {"element": "O", "position": [0.96, 0, 0]},
                {"element": "H", "position": [1.5, 0.6, 0]}
            ],
            "bonds": [
                {"from": 0, "to": 1, "type": "covalent", "order": 1},
                {"from": 1, "to": 2, "type": "covalent", "order": 1}
            ],
            "geometry": "bent"
        }
        """
    )
    
    # Properties
    molecular_weight = models.FloatField(null=True, blank=True)
    is_polar = models.BooleanField(null=True)
    state_at_room_temp = models.CharField(
        max_length=20,
        choices=[
            ('solid', 'Sólido'),
            ('liquid', 'Líquido'),
            ('gas', 'Gas'),
        ],
        blank=True
    )
    
    class Meta:
        verbose_name = "Molécula"
        verbose_name_plural = "Moléculas"
        ordering = ['formula']
    
    def __str__(self):
        return f"{self.formula} - {self.name_es}"
