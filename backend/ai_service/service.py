"""
Servicio de integración con DeepSeek vía Ollama.
Genera explicaciones científicas de reacciones químicas.
"""

import requests
import logging
import json
from django.conf import settings

logger = logging.getLogger(__name__)


class DeepSeekService:
    """
    Cliente para comunicación con Ollama ejecutando modelos de IA.
    
    IMPORTANTE: Este servicio NUNCA inventa reacciones.
    Solo explica reacciones ya validadas en la base de datos.
    """
    
    # Cache para evitar verificar disponibilidad en cada llamada
    _availability_cache = None
    _availability_cache_time = None
    
    def __init__(self):
        self.base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        # Usar llama3.2 como modelo por defecto
        self.model = getattr(settings, 'OLLAMA_MODEL', 'llama3.2:latest')
        self.timeout = 120  # Timeout razonable para respuestas
    
    def is_available(self, use_cache=True):
        """Verifica si Ollama está disponible (con cache de 60 segundos)."""
        import time
        
        # Usar cache si está disponible y no ha expirado (60 segundos)
        if use_cache and DeepSeekService._availability_cache is not None:
            if time.time() - DeepSeekService._availability_cache_time < 60:
                return DeepSeekService._availability_cache
        
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=3)
            available = response.status_code == 200
            if available:
                models = response.json().get('models', [])
                logger.info(f"Ollama disponible. Modelos: {[m.get('name') for m in models]}")
            
            # Guardar en cache
            DeepSeekService._availability_cache = available
            DeepSeekService._availability_cache_time = time.time()
            return available
        except requests.RequestException as e:
            logger.error(f"Ollama no disponible: {e}")
            DeepSeekService._availability_cache = False
            DeepSeekService._availability_cache_time = time.time()
            return False
    
    def get_available_models(self):
        """Obtiene lista de modelos disponibles en Ollama."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                return [m.get('name') for m in response.json().get('models', [])]
            return []
        except requests.RequestException:
            return []
    
    def explain_element(self, element, level='intermediate'):
        """
        Genera explicación científica detallada de un elemento químico.
        
        Args:
            element: Objeto Element de la base de datos
            level: 'basic', 'intermediate', o 'advanced'
        
        Returns:
            str: Explicación generada por el modelo de IA
        """
        prompt = self._build_element_prompt(element, level)
        
        try:
            if not self.is_available():
                logger.warning("Ollama no disponible para explicación de elemento")
                return self._get_fallback_element_explanation(element, level)
            
            # Tokens adaptativos por nivel
            token_limits = {'basic': 300, 'intermediate': 500, 'advanced': 800}
            max_tokens = token_limits.get(level, 500)
            
            response = self._call_ollama(prompt, max_tokens=max_tokens)
            cleaned = self._clean_response(response)
            
            if not cleaned or len(cleaned.strip()) < 20:
                logger.warning(f"Respuesta vacía para elemento: {element.symbol}")
                return self._get_fallback_element_explanation(element, level)
            
            return cleaned
            
        except Exception as e:
            logger.error(f"Error explicando elemento {element.symbol}: {e}")
            return self._get_fallback_element_explanation(element, level)
    
    def _build_element_prompt(self, element, level):
        """Construye prompt para explicar un elemento."""
        
        level_instructions = {
            'basic': "Explica para un estudiante de secundaria. Usa lenguaje simple. Máximo 150 palabras.",
            'intermediate': "Explica para un estudiante universitario. Incluye aplicaciones y propiedades importantes. Máximo 250 palabras.",
            'advanced': "Explica a nivel profesional. Incluye configuración electrónica detallada, propiedades químicas avanzadas y aplicaciones industriales. Máximo 400 palabras."
        }
        
        return f"""Eres un profesor de química experto. Explica el siguiente elemento químico en español:

Elemento: {element.name} ({element.symbol})
Número atómico: {element.atomic_number}
Masa atómica: {element.atomic_mass} u
Categoría: {element.category}
Configuración electrónica: {element.electron_config}
Electrones de valencia: {element.valence_electrons}
Electronegatividad: {element.electronegativity or 'N/A'}
Período: {element.period}, Grupo: {element.group}

{level_instructions.get(level, level_instructions['intermediate'])}

Incluye:
1. Propiedades físicas y químicas principales
2. Dónde se encuentra en la naturaleza
3. Usos y aplicaciones importantes
4. Datos curiosos o históricos

Responde SOLO con la explicación, sin introducción ni despedida."""
    
    def _get_fallback_element_explanation(self, element, level):
        """Genera explicación básica cuando la IA no está disponible."""
        
        category_names = {
            'alkali-metal': 'metal alcalino',
            'alkaline-earth': 'metal alcalinotérreo',
            'transition-metal': 'metal de transición',
            'post-transition-metal': 'metal post-transición',
            'metalloid': 'metaloide',
            'nonmetal': 'no metal',
            'halogen': 'halógeno',
            'noble-gas': 'gas noble',
            'lanthanide': 'lantánido',
            'actinide': 'actínido'
        }
        
        category_name = category_names.get(element.category, element.category)
        
        return f"""{element.name} ({element.symbol}) es un elemento químico clasificado como {category_name}.

**Propiedades básicas:**
• Número atómico: {element.atomic_number}
• Masa atómica: {element.atomic_mass:.4f} u
• Configuración electrónica: {element.electron_config}
• Electrones de valencia: {element.valence_electrons}

**Ubicación en la tabla periódica:**
Se encuentra en el período {element.period} y grupo {element.group}.

**Propiedades físicas:**
• Electronegatividad: {element.electronegativity or 'No disponible'}
• Punto de fusión: {element.melting_point or 'No disponible'} °C
• Punto de ebullición: {element.boiling_point or 'No disponible'} °C

Este elemento tiene {element.atomic_number} protones en su núcleo y típicamente {element.atomic_number} electrones en su configuración neutra."""

    def explain_reaction(self, reaction, level='intermediate'):
        """
        Genera explicación científica de una reacción química.
        
        Args:
            reaction: Objeto Reaction de la base de datos
            level: 'basic', 'intermediate', o 'advanced'
        
        Returns:
            str: Explicación generada por el modelo de IA
        """
        prompt = self._build_prompt(reaction, level)
        
        try:
            # Verificar disponibilidad primero
            if not self.is_available():
                logger.warning("Ollama no está disponible, usando fallback")
                return self._get_fallback_explanation(reaction, level)
            
            # Tokens adaptativos por nivel para reacciones (optimizado para velocidad)
            token_limits = {'basic': 200, 'intermediate': 350, 'advanced': 500}
            max_tokens = token_limits.get(level, 350)
            
            # Intentar obtener respuesta
            response = self._call_ollama(prompt, max_tokens=max_tokens)
            cleaned = self._clean_response(response)
            
            # Validar que la respuesta no esté vacía
            if not cleaned or len(cleaned.strip()) < 20:
                logger.warning(f"Respuesta vacía o muy corta del modelo: '{response[:100] if response else 'None'}'")
                return self._get_fallback_explanation(reaction, level)
            
            return cleaned
            
        except Exception as e:
            logger.error(f"Error calling AI model: {e}", exc_info=True)
            # Fallback a descripción almacenada
            return reaction.description or self._get_fallback_explanation(reaction, level)
    
    def _build_prompt(self, reaction, level):
        """Construye el prompt para DeepSeek."""
        
        level_instructions = {
            'basic': """
Explica esta reacción química para un estudiante de secundaria.
Usa lenguaje simple y ejemplos cotidianos.
Evita términos técnicos complejos.
Mínimo 200 palabras, máximo 300 palabras.

Incluye:
1. Qué sucede paso a paso en la reacción
2. Por qué ocurre esta reacción
3. Un ejemplo de la vida cotidiana donde se ve esto
4. Qué observaríamos si hiciéramos esta reacción
""",
            'intermediate': """
Explica esta reacción química para un estudiante universitario de primer año.
Mínimo 400 palabras, máximo 500 palabras.

Incluye:
1. Descripción detallada del mecanismo de reacción
2. Tipos de enlaces que se rompen y se forman
3. Análisis de electronegatividad de los elementos involucrados
4. Explicación energética (por qué es exotérmica o endotérmica)
5. Condiciones necesarias para que ocurra
6. Aplicaciones prácticas en la industria o laboratorio
7. Precauciones de seguridad relevantes
""",
            'advanced': """
Explica esta reacción química con rigor científico avanzado y profesional.
Mínimo 600 palabras, máximo 800 palabras.

Incluye:
1. Mecanismo de reacción detallado paso a paso
2. Teoría de orbitales moleculares involucrados
3. Análisis termodinámico completo (ΔH, ΔG, ΔS)
4. Cinética de la reacción y factores que la afectan
5. Estados de transición y energía de activación
6. Configuraciones electrónicas de reactivos y productos
7. Aplicaciones industriales y de investigación
8. Historia del descubrimiento de esta reacción
9. Variantes y reacciones relacionadas
10. Impacto ambiental o tecnológico si es relevante
"""
        }
        
        # Construir contexto de la reacción
        reaction_context = f"""
REACCIÓN: {reaction.equation}
TIPO: {reaction.get_reaction_type_display()}
REACTIVOS: {', '.join([r.get('symbol', r.get('formula', '')) for r in reaction.reactants])}
PRODUCTOS: {', '.join([p.get('formula', p.get('name', '')) for p in reaction.products])}
CAMBIO DE ENTALPÍA: {reaction.enthalpy_change or 'No especificado'} kJ/mol
REACCIÓN {'EXOTÉRMICA' if reaction.is_exothermic else 'ENDOTÉRMICA'}
"""
        
        prompt = f"""Eres un profesor de química experto. Tu tarea es explicar la siguiente reacción química REAL.

{reaction_context}

INSTRUCCIONES:
{level_instructions.get(level, level_instructions['intermediate'])}

IMPORTANTE:
- Solo explica lo que REALMENTE ocurre en esta reacción
- No inventes información ni reacciones alternativas
- Sé preciso y educativo
- Responde en español

Tu explicación:"""
        
        return prompt
    
    def _call_ollama(self, prompt, max_tokens=None):
        """Llama a la API de Ollama con parámetros optimizados."""
        url = f"{self.base_url}/api/generate"
        
        # Tokens adaptativos basados en nivel: optimizado para velocidad
        num_tokens = max_tokens or 400  # Reducido para respuestas más rápidas
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,  # Activar streaming para ver progreso
            "options": {
                "temperature": 0.7,  # Balance entre creatividad y coherencia
                "top_p": 0.9,
                "num_predict": num_tokens,
                "num_ctx": 2048  # Contexto reducido para mayor velocidad
            }
        }
        
        logger.info(f"🚀 Llamando a Ollama API con modelo: {self.model}")
        logger.info(f"📝 Tokens máximos: {num_tokens}")
        
        full_response = ""
        token_count = 0
        
        try:
            # Usar streaming para ver progreso
            with requests.post(url, json=payload, timeout=self.timeout, stream=True) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            token = data.get('response', '')
                            full_response += token
                            token_count += 1
                            
                            # Log cada 20 tokens para ver progreso
                            if token_count % 20 == 0:
                                logger.info(f"⏳ Generando... {token_count} tokens ({len(full_response)} chars)")
                            
                            # Verificar si terminó
                            if data.get('done', False):
                                logger.info(f"✅ Generación completada: {token_count} tokens, {len(full_response)} chars")
                                break
                        except json.JSONDecodeError:
                            continue
            
            logger.info(f"📊 Respuesta final: {len(full_response)} caracteres")
            
            if not full_response:
                logger.warning(f"⚠️ Respuesta vacía de Ollama")
            else:
                # Mostrar primeros 200 chars en log
                logger.info(f"📄 Preview: {full_response[:200]}...")
            
            return full_response
            
        except requests.exceptions.Timeout:
            logger.error(f"⏱️ Timeout después de {self.timeout}s")
            raise
        except Exception as e:
            logger.error(f"❌ Error en Ollama: {e}")
            raise
    
    def _clean_response(self, response):
        """Limpia la respuesta del modelo de IA."""
        if not response:
            return ""
            
        import re
        
        # Remover etiquetas <think>...</think> si existen (usadas por DeepSeek-R1)
        response = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)
        
        # Remover otros posibles patrones de "pensamiento"
        response = re.sub(r'\[THINKING\].*?\[/THINKING\]', '', response, flags=re.DOTALL | re.IGNORECASE)
        response = re.sub(r'\*\*Pensando\*\*:.*?(?=\n\n|\Z)', '', response, flags=re.DOTALL)
        
        # Remover prefijos comunes que el modelo podría agregar
        response = re.sub(r'^(Explicación:|Tu explicación:|Respuesta:)\s*', '', response, flags=re.IGNORECASE)
        
        # Normalizar espacios en blanco
        response = re.sub(r'\n{3,}', '\n\n', response)  # Máximo 2 saltos de línea consecutivos
        response = re.sub(r' {2,}', ' ', response)  # Un solo espacio
        
        return response.strip()
    
    def _get_fallback_explanation(self, reaction, level):
        """Genera explicación de respaldo cuando Ollama no está disponible."""
        basic = f"""
Esta es una reacción de {reaction.get_reaction_type_display().lower()}.
En ella, {self._describe_reactants(reaction)} se combinan para formar {self._describe_products(reaction)}.
{'Esta reacción libera energía (exotérmica).' if reaction.is_exothermic else 'Esta reacción absorbe energía (endotérmica).'}
"""
        
        if level == 'basic':
            return basic.strip()
        
        intermediate = basic + f"""
El cambio de entalpía es de {reaction.enthalpy_change or 'un valor no especificado'} kJ/mol.
"""
        
        if level == 'intermediate':
            return intermediate.strip()
        
        # Advanced incluye aplicaciones
        apps = reaction.real_world_applications
        apps_text = f"\n\nAplicaciones: {', '.join(apps)}" if apps else ""
        
        return (intermediate + apps_text).strip()
    
    def _describe_reactants(self, reaction):
        """Describe los reactivos en lenguaje natural."""
        names = []
        for r in reaction.reactants:
            if 'symbol' in r:
                names.append(r['symbol'])
            elif 'formula' in r:
                names.append(r['formula'])
        return ' y '.join(names) if names else 'los reactivos'
    
    def _describe_products(self, reaction):
        """Describe los productos en lenguaje natural."""
        names = []
        for p in reaction.products:
            if 'name' in p:
                names.append(p['name'])
            elif 'formula' in p:
                names.append(p['formula'])
        return ' y '.join(names) if names else 'los productos'
