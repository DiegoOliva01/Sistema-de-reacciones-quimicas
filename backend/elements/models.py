"""
Element model - Represents a chemical element from the periodic table.
"""
from django.db import models


class Element(models.Model):
    """
    Model representing a chemical element.
    Contains all data needed for:
    - Periodic table display
    - 3D visualization (atomic radius, color)
    - Chemical reaction validation
    """
    
    # Basic identification
    atomic_number = models.PositiveIntegerField(primary_key=True)
    symbol = models.CharField(max_length=3, unique=True, db_index=True)
    name = models.CharField(max_length=50)
    name_es = models.CharField(max_length=50, verbose_name="Nombre en español")
    
    # Classification
    CATEGORY_CHOICES = [
        ('alkali-metal', 'Metal alcalino'),
        ('alkaline-earth', 'Metal alcalinotérreo'),
        ('transition-metal', 'Metal de transición'),
        ('post-transition-metal', 'Metal post-transición'),
        ('metalloid', 'Metaloide'),
        ('nonmetal', 'No metal'),
        ('halogen', 'Halógeno'),
        ('noble-gas', 'Gas noble'),
        ('lanthanide', 'Lantánido'),
        ('actinide', 'Actínido'),
        ('unknown', 'Desconocido'),
    ]
    category = models.CharField(max_length=25, choices=CATEGORY_CHOICES)
    
    # Physical properties
    atomic_mass = models.FloatField(help_text="Masa atómica en u")
    density = models.FloatField(null=True, blank=True, help_text="Densidad en g/cm³")
    melting_point = models.FloatField(null=True, blank=True, help_text="Punto de fusión en K")
    boiling_point = models.FloatField(null=True, blank=True, help_text="Punto de ebullición en K")
    
    # Electronic properties
    electronegativity = models.FloatField(null=True, blank=True, help_text="Electronegatividad de Pauling")
    electron_affinity = models.FloatField(null=True, blank=True, help_text="Afinidad electrónica en kJ/mol")
    ionization_energy = models.FloatField(null=True, blank=True, help_text="Primera energía de ionización en kJ/mol")
    electron_config = models.CharField(max_length=100, verbose_name="Configuración electrónica")
    oxidation_states = models.CharField(max_length=100, blank=True, help_text="Estados de oxidación comunes separados por coma")
    
    # Position in periodic table
    group = models.PositiveIntegerField(help_text="Grupo (1-18)")
    period = models.PositiveIntegerField(help_text="Período (1-7)")
    block = models.CharField(max_length=2, help_text="Bloque (s, p, d, f)")
    
    # Visualization data
    color_hex = models.CharField(max_length=7, default="#CCCCCC", help_text="Color hexadecimal para visualización")
    cpk_color = models.CharField(max_length=7, default="#CCCCCC", help_text="Color CPK estándar")
    atomic_radius = models.FloatField(null=True, blank=True, help_text="Radio atómico en pm")
    covalent_radius = models.FloatField(null=True, blank=True, help_text="Radio covalente en pm")
    van_der_waals_radius = models.FloatField(null=True, blank=True, help_text="Radio de van der Waals en pm")
    
    # Metadata
    discovered_by = models.CharField(max_length=200, blank=True)
    year_discovered = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True, help_text="Descripción educativa del elemento")
    
    class Meta:
        ordering = ['atomic_number']
        verbose_name = "Elemento"
        verbose_name_plural = "Elementos"
    
    def __str__(self):
        return f"{self.symbol} - {self.name_es}"
    
    @property
    def valence_electrons(self):
        """Calculate valence electrons based on group and block."""
        if self.block == 's':
            return self.group
        elif self.block == 'p':
            return self.group - 10
        elif self.block == 'd':
            return self.group - 2 if self.group <= 10 else self.group - 10
        else:  # f block
            return 3  # Lanthanides and actinides typically have +3 oxidation state
    
    def get_common_oxidation_states(self):
        """Return list of common oxidation states."""
        if self.oxidation_states:
            return [int(x.strip()) for x in self.oxidation_states.split(',')]
        return []
