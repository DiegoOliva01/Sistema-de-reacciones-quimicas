from django.db import models
from elements.models import Element


class Reaction(models.Model):
    """
    Modelo para reacciones químicas validadas.
    Contiene datos para animación 3D y explicación científica.
    """
    
    REACTION_TYPES = [
        ('synthesis', 'Síntesis'),
        ('decomposition', 'Descomposición'),
        ('single-replacement', 'Sustitución Simple'),
        ('double-replacement', 'Sustitución Doble'),
        ('combustion', 'Combustión'),
        ('acid-base', 'Ácido-Base'),
        ('redox', 'Oxidación-Reducción'),
        ('precipitation', 'Precipitación'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('basic', 'Básico'),
        ('intermediate', 'Intermedio'),
        ('advanced', 'Avanzado'),
    ]
    
    # Ecuación química
    equation = models.CharField(max_length=300)  # "2Na + Cl₂ → 2NaCl"
    equation_html = models.CharField(max_length=500)  # Con subíndices HTML
    
    # Clasificación
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES)
    difficulty_level = models.CharField(max_length=15, choices=DIFFICULTY_LEVELS, default='intermediate')
    
    # Reactivos y productos (JSON)
    reactants = models.JSONField()
    # Ejemplo: [{"symbol": "Na", "count": 2, "state": "s"}, {"formula": "Cl2", "count": 1, "state": "g"}]
    
    products = models.JSONField()
    # Ejemplo: [{"formula": "NaCl", "count": 2, "state": "s", "name": "Cloruro de sodio"}]
    
    # Condiciones de reacción
    conditions = models.JSONField(default=dict)
    # Ejemplo: {"temperature": 25, "pressure": 1, "catalyst": null, "requires_heat": false}
    
    # Termodinámica
    enthalpy_change = models.FloatField(null=True, blank=True)  # ΔH en kJ/mol
    is_exothermic = models.BooleanField(default=True)
    
    # Datos para animación 3D
    animation_data = models.JSONField(default=dict)
    # Ejemplo: {
    #   "bond_type": "ionic",
    #   "electron_transfer": [{"from": "Na", "to": "Cl", "count": 1}],
    #   "stages": ["approach", "transfer", "formation"],
    #   "duration_ms": 5000
    # }
    
    # Relación con elementos
    elements = models.ManyToManyField(Element, through='ReactionElement')
    
    # Metadatos
    description = models.TextField(blank=True)
    real_world_applications = models.JSONField(default=list)
    # Ejemplo: ["Producción de sal de mesa", "Conservación de alimentos"]
    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    
    class Meta:
        ordering = ['difficulty_level', 'reaction_type']
        verbose_name = 'Reacción'
        verbose_name_plural = 'Reacciones'
    
    def __str__(self):
        return self.equation
    
    def get_element_symbols(self):
        """Retorna lista de símbolos de elementos involucrados."""
        symbols = set()
        for reactant in self.reactants:
            if 'symbol' in reactant:
                symbols.add(reactant['symbol'])
            elif 'elements' in reactant:
                symbols.update(reactant['elements'])
        return list(symbols)


class ReactionElement(models.Model):
    """
    Tabla intermedia para relación Reaction-Element.
    Almacena el rol del elemento en la reacción.
    """
    
    ROLE_CHOICES = [
        ('reactant', 'Reactivo'),
        ('product', 'Producto'),
        ('catalyst', 'Catalizador'),
    ]
    
    reaction = models.ForeignKey(Reaction, on_delete=models.CASCADE)
    element = models.ForeignKey(Element, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    coefficient = models.IntegerField(default=1)
    
    class Meta:
        unique_together = ['reaction', 'element', 'role']
