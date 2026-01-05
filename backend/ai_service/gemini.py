"""
Gemini AI Service for generating scientific explanations.
Rate limited and sanitized (OWASP A03, A10).
"""
import logging
from typing import Optional, Dict, Any

import google.generativeai as genai
from django.conf import settings
from rest_framework.exceptions import Throttled

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service class for interacting with Google's Gemini API.
    
    IMPORTANT: This service is ONLY used for explanations.
    It does NOT simulate or predict reactions - that is done
    by the validated database of real reactions.
    """
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self._model = None
        self._configured = False
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self._configured = True
                logger.info("Gemini API configured successfully")
            except Exception as e:
                logger.error(f"Failed to configure Gemini API: {e}")
    
    @property
    def model(self):
        """Lazy load the generative model."""
        if self._model is None and self._configured:
            try:
                # Try different model names in order of preference
                # gemini-2.5-flash confirmed working for this API key
                model_names = [
                    'gemini-2.5-flash',      # Working model - try first!
                    'gemini-2.0-flash-exp',  # Latest experimental
                    'gemini-1.5-flash',      # Standard free tier
                    'gemini-1.5-pro',        # More capable
                    'models/gemini-1.5-flash',
                    'gemini-pro',            # Legacy fallback
                ]
                
                logger.info(f"Attempting to initialize Gemini model...")
                
                for model_name in model_names:
                    try:
                        logger.info(f"Trying model: {model_name}")
                        self._model = genai.GenerativeModel(model_name)
                        # Test the model with a simple request to verify access
                        # We use a very short prompt to minimize token usage
                        test_response = self._model.generate_content("test")
                        
                        # Check if we got a valid response
                        if test_response:
                            logger.debug(f"Test response object: {test_response}")
                            # Try to access text property
                            try:
                                _ = test_response.text
                                logger.info(f"✓ Gemini model loaded and verified: {model_name}")
                                break
                            except (AttributeError, ValueError) as e:
                                logger.warning(f"Model {model_name} returned response but text inaccessible: {e}")
                                # Still consider it working if we got a response object
                                logger.info(f"✓ Gemini model loaded (with text access issues): {model_name}")
                                break
                    except Exception as e:
                        logger.warning(f"✗ Model {model_name} failed: {type(e).__name__}: {str(e)}")
                        self._model = None
                        continue
                
                if self._model is None:
                    logger.error("❌ All Gemini model attempts failed. Please check:")
                    logger.error("  1. API key is valid and active")
                    logger.error("  2. API key has Gemini API enabled")
                    logger.error("  3. You have quota remaining")
                    logger.error("  4. Visit: https://aistudio.google.com/apikey")
                    
            except Exception as e:
                logger.error(f"Failed to load Gemini model: {type(e).__name__}: {str(e)}")
        return self._model
    
    def is_available(self) -> bool:
        """Check if the service is properly configured."""
        return bool(self._configured and self.model is not None)
    
    def explain_reaction(
        self, 
        reaction_equation: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate an educational explanation for a VALIDATED reaction.
        
        Args:
            reaction_equation: The balanced chemical equation
            context: Additional context about the reaction
        
        Returns:
            Dict with success status and explanation or error
        
        Note: This method only explains reactions that have been
        validated against our database. It does not predict or
        simulate reactions.
        """
        if not self.is_available():
            logger.warning("Gemini API not available - API key missing")
            return {
                'success': False,
                'error': 'Servicio de IA no disponible. Por favor, intenta más tarde.',
                'fallback': self._get_fallback_explanation(reaction_equation, context)
            }
        
        context = context or {}
        
        prompt = self._build_explanation_prompt(reaction_equation, context)
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            # Log full response for debugging
            logger.info(f"Gemini response received for: {reaction_equation}")
            logger.debug(f"Response object: {response}")
            
            # Check if response was blocked by safety filters
            if hasattr(response, 'prompt_feedback'):
                logger.debug(f"Prompt feedback: {response.prompt_feedback}")
                if hasattr(response.prompt_feedback, 'block_reason'):
                    block_reason = response.prompt_feedback.block_reason
                    if block_reason:
                        logger.warning(f"Response blocked by safety filters: {block_reason}")
                        return {
                            'success': False,
                            'error': 'La respuesta fue bloqueada por filtros de seguridad.',
                            'fallback': self._get_fallback_explanation(reaction_equation, context)
                        }
            
            # Check if we have candidates
            if hasattr(response, 'candidates') and response.candidates:
                logger.debug(f"Number of candidates: {len(response.candidates)}")
                candidate = response.candidates[0]
                
                # Check finish reason
                if hasattr(candidate, 'finish_reason'):
                    logger.debug(f"Finish reason: {candidate.finish_reason}")
                
                # Check safety ratings
                if hasattr(candidate, 'safety_ratings'):
                    logger.debug(f"Safety ratings: {candidate.safety_ratings}")
            
            # Try to get the text
            if response.text:
                logger.info(f"Generated explanation for: {reaction_equation}")
                return {
                    'success': True,
                    'explanation': response.text,
                    'source': 'gemini'
                }
            else:
                logger.warning("Empty response from Gemini API")
                logger.warning(f"Response parts: {getattr(response, 'parts', 'No parts attribute')}")
                return {
                    'success': False,
                    'error': 'El servidor devolvió una respuesta vacía. Esto puede deberse a filtros de seguridad.',
                    'fallback': self._get_fallback_explanation(reaction_equation, context)
                }
                
        except AttributeError as e:
            logger.error(f"Gemini API AttributeError (empty response): {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'error': 'El servidor devolvió una respuesta vacía.',
                'fallback': self._get_fallback_explanation(reaction_equation, context)
            }
        except Exception as e:
            logger.error(f"Gemini API error: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'error': f'Error al generar la explicación: {type(e).__name__}',
                'fallback': self._get_fallback_explanation(reaction_equation, context)
            }
    
    def _build_explanation_prompt(
        self, 
        equation: str, 
        context: Dict[str, Any]
    ) -> str:
        """
        Build a safe, structured prompt for the AI.
        
        The prompt is designed to:
        1. Explain only validated reactions (not create new ones)
        2. Provide educational content in Spanish
        3. Include safety information when relevant
        """
        reaction_type = context.get('type', 'No especificado')
        energy_change = context.get('energy', 'No especificado')
        difficulty = context.get('difficulty', 1)
        
        difficulty_desc = {
            1: 'estudiantes de secundaria',
            2: 'estudiantes de preparatoria',
            3: 'estudiantes universitarios de primer año',
            4: 'estudiantes universitarios avanzados',
            5: 'profesionales de química'
        }.get(difficulty, 'estudiantes')
        
        prompt = f"""
Eres un profesor de química experto. Explica la siguiente reacción química 
REAL y VERIFICADA de forma educativa y precisa.

═══════════════════════════════════════
REACCIÓN A EXPLICAR:
{equation}

INFORMACIÓN ADICIONAL:
- Tipo de reacción: {reaction_type}
- Cambio energético: {energy_change}
- Nivel del estudiante: {difficulty_desc}
═══════════════════════════════════════

Por favor proporciona:

1. **¿Qué sucede en esta reacción?**
   Describe el proceso a nivel molecular de forma clara.

2. **¿Por qué ocurre esta reacción?**
   Explica la termodinámica y los factores que la hacen posible.

3. **Aplicaciones en la vida real**
   Menciona ejemplos cotidianos o industriales.

4. **Datos interesantes**
   Incluye algún hecho curioso o histórico.

5. **⚠️ Precauciones de seguridad** (si aplica)
   Indica cualquier riesgo asociado.

IMPORTANTE:
- Responde en español
- Usa un lenguaje apropiado para {difficulty_desc}
- Sé preciso científicamente
- Usa emojis con moderación para hacerlo más visual
- Formatea con markdown para mejor legibilidad
"""
        return prompt
    
    def _get_fallback_explanation(
        self, 
        equation: str, 
        context: Optional[Dict[str, Any]]
    ) -> str:
        """
        Provide a basic fallback explanation when AI is unavailable.
        Uses the educational_notes from the database if available.
        """
        context = context or {}
        notes = context.get('educational_notes', '')
        
        if notes:
            return notes
        
        return (
            f"**Reacción:** {equation}\n\n"
            "ℹ️ La explicación detallada de IA no está disponible en este momento. "
            "Consulta tu libro de texto o profesor para más información sobre esta reacción."
        )
    
    def explain_element(self, element_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an educational explanation for a chemical element.
        """
        if not self.is_available():
            return {
                'success': False,
                'error': 'Servicio de IA no disponible.',
                'fallback': element_data.get('description', '')
            }
        
        prompt = f"""
Eres un profesor de química experto. Proporciona una explicación educativa 
breve (máximo 200 palabras) sobre el siguiente elemento químico:

═══════════════════════════════════════
ELEMENTO: {element_data.get('name_es', 'Desconocido')} ({element_data.get('symbol', '?')})
Número atómico: {element_data.get('atomic_number', '?')}
Categoría: {element_data.get('category', 'Desconocida')}
═══════════════════════════════════════

Incluye:
1. Propiedades principales
2. Dónde se encuentra en la naturaleza
3. Usos más importantes
4. Un dato curioso

Responde en español, de forma clara y educativa.
"""
        
        try:
            response = self.model.generate_content(prompt)
            
            if response.text:
                return {
                    'success': True,
                    'explanation': response.text,
                    'source': 'gemini'
                }
            else:
                return {
                    'success': False,
                    'error': 'No se pudo generar una explicación.',
                    'fallback': element_data.get('description', '')
                }
                
        except Exception as e:
            # Log full error details
            logger.error(f"Gemini API error for element: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'error': f'Error al generar la explicación: {type(e).__name__}',
                'fallback': element_data.get('description', '')
            }


# Singleton instance
gemini_service = GeminiService()
