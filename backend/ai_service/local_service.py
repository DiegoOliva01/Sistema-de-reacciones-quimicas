"""
Local AI Service for generating explanations without external API keys.
Uses templates and database data to construct educational responses.
"""
import random

class LocalAIService:
    def explain_element(self, element_data):
        """Generate an explanation for an element using templates."""
        name = element_data.get('name_es', element_data.get('symbol'))
        symbol = element_data.get('symbol')
        number = element_data.get('atomic_number')
        category = element_data.get('category', 'Elemento')
        desc = element_data.get('description', '')

        intro_templates = [
            f"El **{name}** ({symbol}) es un elemento fascinante con número atómico {number}.",
            f"Con el símbolo **{symbol}**, el **{name}** ocupa la posición {number} en la tabla periódica.",
            f"El elemento número {number} es el **{name}** ({symbol}), clasificado como {category}.",
        ]

        category_info = {
            'Alkali Metal': "Como metal alcalino, es altamente reactivo y nunca se encuentra puro en la naturaleza.",
            'Alkaline Earth Metal': "Es un metal alcalinotérreo, reactivo pero menos que los metales alcalinos.",
            'Transition Metal': "Es un metal de transición, conocido por formar compuestos coloridos y tener varios estados de oxidación.",
            'Noble Gas': "Es un gas noble, caracterizado por su gran estabilidad y falta de reactividad química.",
            'Halogen': "Pertenece a los halógenos, elementos muy reactivos que forman sales fácilmente.",
            'Nonmetal': "Es un no metal, fundamental para la vida y con propiedades muy variadas.",
            'Metalloid': "Es un metaloide, con propiedades intermedias entre metales y no metales.",
        }

        cat_desc = category_info.get(category, f"Pertenece a la categoría de los {category}.")

        explanation = f"""
## {symbol} - {name}

{random.choice(intro_templates)}

**Propiedades Químicas:**
{cat_desc} {desc}

**Datos Clave:**
- **Número Atómico:** {number}
- **Categoría:** {category}

Este elemento es fundamental para comprender la química. Su estructura atómica define cómo interactúa con otros elementos para formar compuestos.
        """.strip()

        return {
            'success': True,
            'explanation': explanation,
            'source': 'local_template'
        }

    def explain_reaction(self, reaction_obj):
        """Generate an explanation for a reaction using templates."""
        name = reaction_obj.name
        equation = reaction_obj.equation
        type_name = reaction_obj.get_reaction_type_display()
        energy = reaction_obj.get_energy_change_display()
        notes = reaction_obj.educational_notes or ""

        # Analyze reaction type
        type_explanations = {
            'synthesis': "dos o más sustancias se combinan para formar un producto más complejo. Es como construir una estructura con bloques.",
            'decomposition': "una sustancia compleja se descompone en sustancias más simples. Es el proceso inverso a la síntesis.",
            'combustion': "una sustancia reacciona rápidamente con oxígeno, liberando energía en forma de luz y calor.",
            'displacement': "un elemento más reactivo desplaza a otro menos reactivo de su compuesto.",
            'double_displacement': "los iones de dos compuestos intercambian lugares en una solución acuosa para formar dos nuevos compuestos.",
            'neutralization': "un ácido y una base reaccionan para formar agua y una sal, neutralizando sus propiedades.",
        }

        type_desc = type_explanations.get(reaction_obj.reaction_type, "ocurre una transformación química significativa.")

        # Analyze energy
        energy_desc = ""
        if reaction_obj.energy_change == 'exothermic':
            energy_desc = "Esta es una reacción **exotérmica**, lo que significa que libera energía al entorno, generalmente como calor."
        elif reaction_obj.energy_change == 'endothermic':
            energy_desc = "Esta es una reacción **endotérmica**, por lo que necesita absorber energía del entorno para ocurrir."

        explanation = f"""
## Análisis del Experimento

En la reacción **{name}**, observamos la ecuación:
`{equation}`

**¿Qué está sucediendo?**
En este tipo de reacción de **{type_name}**, {type_desc}

**Aspectos Energéticos:**
{energy_desc}

**Notas Educativas:**
{notes if notes else "Esta reacción es un ejemplo clásico estudiado en química para entender los principios de conservación de la masa y la energía."}
        """.strip()

        return {
            'success': True,
            'explanation': explanation,
            'source': 'local_template'
        }

# Singleton
local_ai = LocalAIService()
