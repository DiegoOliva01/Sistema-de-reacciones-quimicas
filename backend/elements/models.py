from django.db import models


class Element(models.Model):
    """
    Modelo para elementos químicos de la tabla periódica.
    Contiene propiedades atómicas y datos para visualización.
    """
    
    CATEGORY_CHOICES = [
        ('alkali-metal', 'Metal Alcalino'),
        ('alkaline-earth', 'Metal Alcalinotérreo'),
        ('transition-metal', 'Metal de Transición'),
        ('post-transition-metal', 'Metal Post-Transición'),
        ('metalloid', 'Metaloide'),
        ('nonmetal', 'No Metal'),
        ('halogen', 'Halógeno'),
        ('noble-gas', 'Gas Noble'),
        ('lanthanide', 'Lantánido'),
        ('actinide', 'Actínido'),
    ]
    
    # Identificación
    symbol = models.CharField(max_length=3, unique=True, db_index=True)
    name = models.CharField(max_length=50)
    name_en = models.CharField(max_length=50)
    
    # Propiedades atómicas
    atomic_number = models.IntegerField(unique=True)
    atomic_mass = models.FloatField()
    category = models.CharField(max_length=25, choices=CATEGORY_CHOICES)
    
    # Configuración electrónica
    electron_config = models.CharField(max_length=100)
    electrons_per_shell = models.JSONField(default=list)  # [2, 8, 1] para Na
    valence_electrons = models.IntegerField(default=0)
    
    # Propiedades químicas
    electronegativity = models.FloatField(null=True, blank=True)
    ionization_energy = models.FloatField(null=True, blank=True)  # kJ/mol
    electron_affinity = models.FloatField(null=True, blank=True)  # kJ/mol
    
    # Propiedades físicas
    density = models.FloatField(null=True, blank=True)  # g/cm³
    melting_point = models.FloatField(null=True, blank=True)  # K
    boiling_point = models.FloatField(null=True, blank=True)  # K
    
    # Posición en tabla periódica
    period = models.IntegerField()
    group = models.IntegerField(null=True, blank=True)
    
    # Visualización
    color_hex = models.CharField(max_length=7, default='#CCCCCC')
    
    class Meta:
        ordering = ['atomic_number']
        verbose_name = 'Elemento'
        verbose_name_plural = 'Elementos'
    
    def __str__(self):
        return f"{self.symbol} - {self.name}"
    
    def get_electron_shells(self):
        """Retorna datos para visualización 3D de capas electrónicas."""
        shells = []
        for i, count in enumerate(self.electrons_per_shell, start=1):
            shells.append({
                'shell': i,
                'electrons': count,
                'radius': 1.0 + (i * 0.8)  # Radio orbital para Three.js
            })
        return shells
