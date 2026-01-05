"""
Ollama AI Service for generating explanations using local LLM models.
Uses Ollama API to provide intelligent responses without external API keys.
"""
import requests
import logging

logger = logging.getLogger(__name__)

class OllamaAIService:
    def __init__(self, base_url="http://localhost:11434", model="llama3.2"):
        self.base_url = base_url
        self.model = model
        
    def is_available(self):
        """Check if Ollama service is running."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama not available: {str(e)}")
            return False
    
    def _generate(self, prompt, system_prompt="Eres un profesor de química experto que explica conceptos de manera clara y educativa."):
        """Generate text using Ollama."""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 300  # Limit tokens for faster response
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=60  # Increased timeout for first-time model load
            )
            
            if response.status_code == 200:
                return response.json().get("response", "")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Ollama generation error: {str(e)}")
            return None
    
    def explain_element(self, element_data):
        """Generate an explanation for an element using Ollama."""
        name = element_data.get('name_es', element_data.get('symbol'))
        symbol = element_data.get('symbol')
        number = element_data.get('atomic_number')
        category = element_data.get('category', 'Elemento')
        desc = element_data.get('description', '')
        
        prompt = f"""
Explica el elemento químico {name} ({symbol}) con número atómico {number}.
Categoría: {category}
{f'Información adicional: {desc}' if desc else ''}

Proporciona una explicación educativa en español de aproximadamente 150 palabras que incluya:
1. Propiedades químicas principales
2. Importancia o aplicaciones
3. Curiosidades interesantes

Usa formato Markdown con encabezados ##.
"""
        
        system_prompt = "Eres un profesor de química experto que explica conceptos de manera clara, educativa y entusiasta. Usas formato Markdown."
        
        explanation = self._generate(prompt, system_prompt)
        
        if explanation:
            return {
                'success': True,
                'explanation': explanation,
                'source': 'ollama'
            }
        else:
            # Fallback to local service
            from .local_service import local_ai
            return local_ai.explain_element(element_data)
    
    def explain_reaction(self, reaction_obj):
        """Generate an explanation for a reaction using Ollama."""
        name = reaction_obj.name
        equation = reaction_obj.equation
        type_name = reaction_obj.get_reaction_type_display()
        energy = reaction_obj.get_energy_change_display()
        notes = reaction_obj.educational_notes or ""
        
        prompt = f"""
Explica la reacción química llamada "{name}":
Ecuación: {equation}
Tipo: {type_name}
Cambio de energía: {energy}
{f'Notas: {notes}' if notes else ''}

Proporciona una explicación educativa en español de aproximadamente 200 palabras que incluya:
1. Qué está sucediendo en la reacción
2. Por qué es importante esta reacción
3. Aspectos energéticos
4. Aplicaciones o ejemplos de la vida real

Usa formato Markdown con encabezados ##.
"""
        
        system_prompt = "Eres un profesor de química experto que explica reacciones químicas de manera clara, educativa y entusiasta. Usas formato Markdown."
        
        explanation = self._generate(prompt, system_prompt)
        
        if explanation:
            return {
                'success': True,
                'explanation': explanation,
                'source': 'ollama'
            }
        else:
            # Fallback to local service
            from .local_service import local_ai
            return local_ai.explain_reaction(reaction_obj)

# Singleton
ollama_service = OllamaAIService()
