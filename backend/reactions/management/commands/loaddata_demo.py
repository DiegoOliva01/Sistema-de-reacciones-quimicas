"""
Django management command to load sample chemical reactions and elements.
Run with: python manage.py loaddata_demo
"""
from django.core.management.base import BaseCommand
from elements.models import Element
from reactions.models import Reaction, ReactionElement, Molecule


class Command(BaseCommand):
    help = 'Load sample chemical elements and reactions for demo'
    
    def handle(self, *args, **options):
        self.stdout.write('Loading sample data...')
        
        # Load elements first
        self.load_elements()
        
        # Load molecules
        self.load_molecules()
        
        # Load reactions
        self.load_reactions()
        
        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))
    
    def load_elements(self):
        """Load the first 36 elements (up to Krypton)"""
        elements_data = [
            # Period 1
            {'atomic_number': 1, 'symbol': 'H', 'name': 'Hydrogen', 'name_es': 'Hidrógeno', 'category': 'nonmetal', 'atomic_mass': 1.008, 'electronegativity': 2.20, 'electron_config': '1s¹', 'group': 1, 'period': 1, 'block': 's', 'color_hex': '#FFFFFF', 'cpk_color': '#FFFFFF', 'atomic_radius': 53},
            {'atomic_number': 2, 'symbol': 'He', 'name': 'Helium', 'name_es': 'Helio', 'category': 'noble-gas', 'atomic_mass': 4.003, 'electronegativity': None, 'electron_config': '1s²', 'group': 18, 'period': 1, 'block': 's', 'color_hex': '#D9FFFF', 'cpk_color': '#D9FFFF', 'atomic_radius': 31},
            
            # Period 2
            {'atomic_number': 3, 'symbol': 'Li', 'name': 'Lithium', 'name_es': 'Litio', 'category': 'alkali-metal', 'atomic_mass': 6.941, 'electronegativity': 0.98, 'electron_config': '[He] 2s¹', 'group': 1, 'period': 2, 'block': 's', 'color_hex': '#CC80FF', 'cpk_color': '#CC80FF', 'atomic_radius': 167},
            {'atomic_number': 4, 'symbol': 'Be', 'name': 'Beryllium', 'name_es': 'Berilio', 'category': 'alkaline-earth', 'atomic_mass': 9.012, 'electronegativity': 1.57, 'electron_config': '[He] 2s²', 'group': 2, 'period': 2, 'block': 's', 'color_hex': '#C2FF00', 'cpk_color': '#C2FF00', 'atomic_radius': 112},
            {'atomic_number': 5, 'symbol': 'B', 'name': 'Boron', 'name_es': 'Boro', 'category': 'metalloid', 'atomic_mass': 10.81, 'electronegativity': 2.04, 'electron_config': '[He] 2s² 2p¹', 'group': 13, 'period': 2, 'block': 'p', 'color_hex': '#FFB5B5', 'cpk_color': '#FFB5B5', 'atomic_radius': 87},
            {'atomic_number': 6, 'symbol': 'C', 'name': 'Carbon', 'name_es': 'Carbono', 'category': 'nonmetal', 'atomic_mass': 12.01, 'electronegativity': 2.55, 'electron_config': '[He] 2s² 2p²', 'group': 14, 'period': 2, 'block': 'p', 'color_hex': '#909090', 'cpk_color': '#909090', 'atomic_radius': 67},
            {'atomic_number': 7, 'symbol': 'N', 'name': 'Nitrogen', 'name_es': 'Nitrógeno', 'category': 'nonmetal', 'atomic_mass': 14.01, 'electronegativity': 3.04, 'electron_config': '[He] 2s² 2p³', 'group': 15, 'period': 2, 'block': 'p', 'color_hex': '#3050F8', 'cpk_color': '#3050F8', 'atomic_radius': 56},
            {'atomic_number': 8, 'symbol': 'O', 'name': 'Oxygen', 'name_es': 'Oxígeno', 'category': 'nonmetal', 'atomic_mass': 16.00, 'electronegativity': 3.44, 'electron_config': '[He] 2s² 2p⁴', 'group': 16, 'period': 2, 'block': 'p', 'color_hex': '#FF0D0D', 'cpk_color': '#FF0D0D', 'atomic_radius': 48},
            {'atomic_number': 9, 'symbol': 'F', 'name': 'Fluorine', 'name_es': 'Flúor', 'category': 'halogen', 'atomic_mass': 19.00, 'electronegativity': 3.98, 'electron_config': '[He] 2s² 2p⁵', 'group': 17, 'period': 2, 'block': 'p', 'color_hex': '#90E050', 'cpk_color': '#90E050', 'atomic_radius': 42},
            {'atomic_number': 10, 'symbol': 'Ne', 'name': 'Neon', 'name_es': 'Neón', 'category': 'noble-gas', 'atomic_mass': 20.18, 'electronegativity': None, 'electron_config': '[He] 2s² 2p⁶', 'group': 18, 'period': 2, 'block': 'p', 'color_hex': '#B3E3F5', 'cpk_color': '#B3E3F5', 'atomic_radius': 38},
            
            # Period 3
            {'atomic_number': 11, 'symbol': 'Na', 'name': 'Sodium', 'name_es': 'Sodio', 'category': 'alkali-metal', 'atomic_mass': 22.99, 'electronegativity': 0.93, 'electron_config': '[Ne] 3s¹', 'group': 1, 'period': 3, 'block': 's', 'color_hex': '#AB5CF2', 'cpk_color': '#AB5CF2', 'atomic_radius': 190},
            {'atomic_number': 12, 'symbol': 'Mg', 'name': 'Magnesium', 'name_es': 'Magnesio', 'category': 'alkaline-earth', 'atomic_mass': 24.31, 'electronegativity': 1.31, 'electron_config': '[Ne] 3s²', 'group': 2, 'period': 3, 'block': 's', 'color_hex': '#8AFF00', 'cpk_color': '#8AFF00', 'atomic_radius': 145},
            {'atomic_number': 13, 'symbol': 'Al', 'name': 'Aluminum', 'name_es': 'Aluminio', 'category': 'post-transition-metal', 'atomic_mass': 26.98, 'electronegativity': 1.61, 'electron_config': '[Ne] 3s² 3p¹', 'group': 13, 'period': 3, 'block': 'p', 'color_hex': '#BFA6A6', 'cpk_color': '#BFA6A6', 'atomic_radius': 118},
            {'atomic_number': 14, 'symbol': 'Si', 'name': 'Silicon', 'name_es': 'Silicio', 'category': 'metalloid', 'atomic_mass': 28.09, 'electronegativity': 1.90, 'electron_config': '[Ne] 3s² 3p²', 'group': 14, 'period': 3, 'block': 'p', 'color_hex': '#F0C8A0', 'cpk_color': '#F0C8A0', 'atomic_radius': 111},
            {'atomic_number': 15, 'symbol': 'P', 'name': 'Phosphorus', 'name_es': 'Fósforo', 'category': 'nonmetal', 'atomic_mass': 30.97, 'electronegativity': 2.19, 'electron_config': '[Ne] 3s² 3p³', 'group': 15, 'period': 3, 'block': 'p', 'color_hex': '#FF8000', 'cpk_color': '#FF8000', 'atomic_radius': 98},
            {'atomic_number': 16, 'symbol': 'S', 'name': 'Sulfur', 'name_es': 'Azufre', 'category': 'nonmetal', 'atomic_mass': 32.07, 'electronegativity': 2.58, 'electron_config': '[Ne] 3s² 3p⁴', 'group': 16, 'period': 3, 'block': 'p', 'color_hex': '#FFFF30', 'cpk_color': '#FFFF30', 'atomic_radius': 88},
            {'atomic_number': 17, 'symbol': 'Cl', 'name': 'Chlorine', 'name_es': 'Cloro', 'category': 'halogen', 'atomic_mass': 35.45, 'electronegativity': 3.16, 'electron_config': '[Ne] 3s² 3p⁵', 'group': 17, 'period': 3, 'block': 'p', 'color_hex': '#1FF01F', 'cpk_color': '#1FF01F', 'atomic_radius': 79},
            {'atomic_number': 18, 'symbol': 'Ar', 'name': 'Argon', 'name_es': 'Argón', 'category': 'noble-gas', 'atomic_mass': 39.95, 'electronegativity': None, 'electron_config': '[Ne] 3s² 3p⁶', 'group': 18, 'period': 3, 'block': 'p', 'color_hex': '#80D1E3', 'cpk_color': '#80D1E3', 'atomic_radius': 71},
            
            # Period 4 (selected)
            {'atomic_number': 19, 'symbol': 'K', 'name': 'Potassium', 'name_es': 'Potasio', 'category': 'alkali-metal', 'atomic_mass': 39.10, 'electronegativity': 0.82, 'electron_config': '[Ar] 4s¹', 'group': 1, 'period': 4, 'block': 's', 'color_hex': '#8F40D4', 'cpk_color': '#8F40D4', 'atomic_radius': 243},
            {'atomic_number': 20, 'symbol': 'Ca', 'name': 'Calcium', 'name_es': 'Calcio', 'category': 'alkaline-earth', 'atomic_mass': 40.08, 'electronegativity': 1.00, 'electron_config': '[Ar] 4s²', 'group': 2, 'period': 4, 'block': 's', 'color_hex': '#3DFF00', 'cpk_color': '#3DFF00', 'atomic_radius': 194},
            {'atomic_number': 26, 'symbol': 'Fe', 'name': 'Iron', 'name_es': 'Hierro', 'category': 'transition-metal', 'atomic_mass': 55.85, 'electronegativity': 1.83, 'electron_config': '[Ar] 3d⁶ 4s²', 'group': 8, 'period': 4, 'block': 'd', 'color_hex': '#E06633', 'cpk_color': '#E06633', 'atomic_radius': 156},
            {'atomic_number': 29, 'symbol': 'Cu', 'name': 'Copper', 'name_es': 'Cobre', 'category': 'transition-metal', 'atomic_mass': 63.55, 'electronegativity': 1.90, 'electron_config': '[Ar] 3d¹⁰ 4s¹', 'group': 11, 'period': 4, 'block': 'd', 'color_hex': '#C88033', 'cpk_color': '#C88033', 'atomic_radius': 145},
            {'atomic_number': 30, 'symbol': 'Zn', 'name': 'Zinc', 'name_es': 'Zinc', 'category': 'transition-metal', 'atomic_mass': 65.38, 'electronegativity': 1.65, 'electron_config': '[Ar] 3d¹⁰ 4s²', 'group': 12, 'period': 4, 'block': 'd', 'color_hex': '#7D80B0', 'cpk_color': '#7D80B0', 'atomic_radius': 142},
        ]
        
        for data in elements_data:
            Element.objects.update_or_create(
                atomic_number=data['atomic_number'],
                defaults=data
            )
        
        self.stdout.write(f'  Loaded {len(elements_data)} elements')
    
    def load_molecules(self):
        """Load common molecules"""
        molecules_data = [
            {
                'formula': 'H2O',
                'name': 'Water',
                'name_es': 'Agua',
                'molecular_weight': 18.015,
                'is_polar': True,
                'state_at_room_temp': 'liquid',
                'structure_3d': {
                    'atoms': [
                        {'element': 'O', 'position': [0, 0, 0]},
                        {'element': 'H', 'position': [-0.8, 0.6, 0]},
                        {'element': 'H', 'position': [0.8, 0.6, 0]},
                    ],
                    'bonds': [
                        {'from': 0, 'to': 1, 'type': 'covalent', 'order': 1},
                        {'from': 0, 'to': 2, 'type': 'covalent', 'order': 1},
                    ],
                    'geometry': 'bent'
                }
            },
            {
                'formula': 'CO2',
                'name': 'Carbon Dioxide',
                'name_es': 'Dióxido de Carbono',
                'molecular_weight': 44.01,
                'is_polar': False,
                'state_at_room_temp': 'gas',
                'structure_3d': {
                    'atoms': [
                        {'element': 'C', 'position': [0, 0, 0]},
                        {'element': 'O', 'position': [-1.2, 0, 0]},
                        {'element': 'O', 'position': [1.2, 0, 0]},
                    ],
                    'bonds': [
                        {'from': 0, 'to': 1, 'type': 'covalent', 'order': 2},
                        {'from': 0, 'to': 2, 'type': 'covalent', 'order': 2},
                    ],
                    'geometry': 'linear'
                }
            },
            {
                'formula': 'NaCl',
                'name': 'Sodium Chloride',
                'name_es': 'Cloruro de Sodio',
                'molecular_weight': 58.44,
                'is_polar': True,
                'state_at_room_temp': 'solid',
                'structure_3d': {
                    'atoms': [
                        {'element': 'Na', 'position': [-0.7, 0, 0]},
                        {'element': 'Cl', 'position': [0.7, 0, 0]},
                    ],
                    'bonds': [
                        {'from': 0, 'to': 1, 'type': 'ionic', 'order': 1},
                    ],
                    'geometry': 'linear'
                }
            },
        ]
        
        for data in molecules_data:
            Molecule.objects.update_or_create(
                formula=data['formula'],
                defaults=data
            )
        
        self.stdout.write(f'  Loaded {len(molecules_data)} molecules')
    
    def load_reactions(self):
        """Load sample chemical reactions"""
        reactions_data = [
            {
                'name': 'Formación de Agua',
                'equation': '2H₂ + O₂ → 2H₂O',
                'reaction_type': 'synthesis',
                'is_reversible': False,
                'energy_change': 'exothermic',
                'enthalpy_change': -572,
                'difficulty_level': 1,
                'educational_notes': 'Una de las reacciones más fundamentales. El hidrógeno se combina con oxígeno para formar agua, liberando una gran cantidad de energía.',
                'real_world_examples': 'Células de combustible de hidrógeno, motores de cohetes.',
                'safety_warnings': '⚠️ Mezcla explosiva. Mantener alejado de llamas.',
                'elements': [('H', 'reactant', 2), ('O', 'reactant', 1)],
                'animation_data': {
                    'reactants': [
                        {'molecule': 'H2', 'count': 2, 'atoms': [
                            {'element': 'H', 'position': [-2, 0.3, 0]},
                            {'element': 'H', 'position': [-1.4, 0.3, 0]},
                            {'element': 'H', 'position': [-2, -0.3, 0]},
                            {'element': 'H', 'position': [-1.4, -0.3, 0]},
                        ]},
                        {'molecule': 'O2', 'count': 1, 'atoms': [
                            {'element': 'O', 'position': [1.5, 0, 0]},
                            {'element': 'O', 'position': [2.3, 0, 0]},
                        ]}
                    ],
                    'products': [
                        {'molecule': 'H2O', 'count': 2, 'atoms': [
                            {'element': 'O', 'position': [0, 0, 0]},
                            {'element': 'H', 'position': [-0.8, 0.6, 0]},
                            {'element': 'H', 'position': [0.8, 0.6, 0]},
                        ]}
                    ],
                    'total_duration_ms': 5000
                }
            },
            {
                'name': 'Combustión del Metano',
                'equation': 'CH₄ + 2O₂ → CO₂ + 2H₂O',
                'reaction_type': 'combustion',
                'is_reversible': False,
                'energy_change': 'exothermic',
                'enthalpy_change': -890,
                'difficulty_level': 2,
                'educational_notes': 'Combustión completa del gas natural. Es la principal fuente de energía en muchos hogares.',
                'real_world_examples': 'Cocinas de gas, calentadores, plantas de energía.',
                'safety_warnings': '⚠️ Gas inflamable. Mantener ventilación adecuada.',
                'elements': [('C', 'reactant', 1), ('H', 'reactant', 4), ('O', 'reactant', 2)],
                'animation_data': {
                    'total_duration_ms': 6000
                }
            },
            {
                'name': 'Formación de Cloruro de Sodio',
                'equation': '2Na + Cl₂ → 2NaCl',
                'reaction_type': 'synthesis',
                'is_reversible': False,
                'energy_change': 'exothermic',
                'enthalpy_change': -411,
                'difficulty_level': 2,
                'educational_notes': 'El sodio metálico reacciona vigorosamente con el cloro gaseoso para formar sal de mesa.',
                'real_world_examples': 'Producción industrial de sal, demostración en laboratorio.',
                'safety_warnings': '⚠️ Reacción muy violenta. Sodio inflamable al contacto con agua.',
                'elements': [('Na', 'reactant', 2), ('Cl', 'reactant', 1)],
                'animation_data': {
                    'total_duration_ms': 4000
                }
            },
            {
                'name': 'Oxidación del Hierro (Herrumbre)',
                'equation': '4Fe + 3O₂ → 2Fe₂O₃',
                'reaction_type': 'redox',
                'is_reversible': False,
                'energy_change': 'exothermic',
                'enthalpy_change': -1648,
                'difficulty_level': 2,
                'educational_notes': 'El hierro se oxida lentamente al exponerse al oxígeno y humedad, formando óxido de hierro III (herrumbre).',
                'real_world_examples': 'Corrosión de estructuras metálicas, proceso natural de oxidación.',
                'safety_warnings': 'Proceso lento a temperatura ambiente.',
                'elements': [('Fe', 'reactant', 4), ('O', 'reactant', 3)],
                'animation_data': {
                    'total_duration_ms': 5000
                }
            },
            {
                'name': 'Síntesis del Amoníaco (Haber-Bosch)',
                'equation': 'N₂ + 3H₂ ⇌ 2NH₃',
                'reaction_type': 'synthesis',
                'is_reversible': True,
                'energy_change': 'exothermic',
                'enthalpy_change': -92,
                'requires_catalyst': True,
                'catalyst': 'Hierro',
                'temperature_range': '400-500°C',
                'pressure_conditions': '150-300 atm',
                'difficulty_level': 4,
                'educational_notes': 'Proceso industrial fundamental para la producción de fertilizantes. Desarrollado por Fritz Haber y Carl Bosch.',
                'real_world_examples': 'Fertilizantes agrícolas, explosivos, productos químicos.',
                'elements': [('N', 'reactant', 1), ('H', 'reactant', 3)],
                'animation_data': {
                    'total_duration_ms': 6000
                }
            },
            {
                'name': 'Neutralización Ácido-Base',
                'equation': 'HCl + NaOH → NaCl + H₂O',
                'reaction_type': 'acid_base',
                'is_reversible': False,
                'energy_change': 'exothermic',
                'enthalpy_change': -57,
                'difficulty_level': 1,
                'educational_notes': 'Reacción clásica de neutralización entre un ácido fuerte y una base fuerte.',
                'real_world_examples': 'Antiácidos estomacales, tratamiento de aguas.',
                'elements': [('H', 'reactant', 1), ('Cl', 'reactant', 1), ('Na', 'reactant', 1), ('O', 'reactant', 1)],
                'animation_data': {
                    'total_duration_ms': 4000
                }
            },
        ]
        
        for data in reactions_data:
            elements = data.pop('elements', [])
            
            reaction, created = Reaction.objects.update_or_create(
                equation=data['equation'],
                defaults={**data, 'is_verified': True}
            )
            
            # Add reaction elements
            if created:
                for symbol, role, coef in elements:
                    try:
                        element = Element.objects.get(symbol=symbol)
                        ReactionElement.objects.create(
                            reaction=reaction,
                            element=element,
                            role=role,
                            coefficient=coef
                        )
                    except Element.DoesNotExist:
                        self.stdout.write(
                            self.style.WARNING(f'  Element {symbol} not found')
                        )
        
        self.stdout.write(f'  Loaded {len(reactions_data)} reactions')
