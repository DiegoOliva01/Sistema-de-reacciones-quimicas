"""
Script de diagnóstico para la configuración de Gemini API
Ejecutar: python test_gemini_api.py
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("DIAGNÓSTICO DE GEMINI API")
print("=" * 60)

# Check 1: API Key exists
api_key = os.getenv('GEMINI_API_KEY', '')
print("\n1. Verificando clave API...")
if api_key:
    print(f"   ✓ GEMINI_API_KEY encontrada")
    print(f"   - Longitud: {len(api_key)} caracteres")
    print(f"   - Comienza con: {api_key[:15]}...")
    print(f"   - Termina con: ...{api_key[-10:]}")
else:
    print("   ✗ GEMINI_API_KEY NO encontrada en .env")
    print("   → Necesitas obtener una clave en: https://aistudio.google.com/apikey")
    sys.exit(1)

# Check 2: google-generativeai package
print("\n2. Verificando paquete google-generativeai...")
try:
    import google.generativeai as genai
    print(f"   ✓ Paquete importado correctamente")
    print(f"   - Versión: {genai.__version__ if hasattr(genai, '__version__') else 'desconocida'}")
except ImportError as e:
    print(f"   ✗ Error al importar: {e}")
    print("   → Ejecuta: pip install google-generativeai")
    sys.exit(1)

# Check 3: Configure API
print("\n3. Configurando API...")
try:
    genai.configure(api_key=api_key)
    print("   ✓ API configurada")
except Exception as e:
    print(f"   ✗ Error al configurar: {e}")
    sys.exit(1)

# Check 4: Try different models
print("\n4. Probando modelos disponibles...")
model_names = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.5-flash',
    'gemini-pro',
]

working_model = None
for model_name in model_names:
    try:
        print(f"\n   Probando: {model_name}")
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Di 'hola' en español")
        
        # Try to access the text
        if response.text:
            print(f"   ✓ FUNCIONA: {model_name}")
            print(f"   - Respuesta: {response.text[:50]}...")
            working_model = model_name
            break
        else:
            print(f"   ⚠ Modelo responde pero sin texto")
            print(f"   - Response: {response}")
            if hasattr(response, 'prompt_feedback'):
                print(f"   - Feedback: {response.prompt_feedback}")
    except AttributeError as e:
        print(f"   ✗ Error de atributo: {e}")
        print(f"   → Respuesta vacía o bloqueada")
    except Exception as e:
        print(f"   ✗ Error: {type(e).__name__}: {str(e)[:100]}")

if working_model:
    print("\n" + "=" * 60)
    print(f"✓ CONFIGURACIÓN EXITOSA")
    print(f"✓ Modelo funcionando: {working_model}")
    print("=" * 60)
    
    # Test with a chemistry prompt
    print("\n5. Prueba con prompt de química...")
    try:
        model = genai.GenerativeModel(working_model)
        response = model.generate_content(
            "Explica brevemente qué es una reacción de combustión",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=200,
            )
        )
        print(f"   ✓ Respuesta generada:")
        print(f"\n{response.text}\n")
    except Exception as e:
        print(f"   ✗ Error: {e}")
else:
    print("\n" + "=" * 60)
    print("✗ NINGÚN MODELO FUNCIONA")
    print("=" * 60)
    print("\nPosibles causas:")
    print("1. La clave API no es válida o está vencida")
    print("2. No tienes cuota disponible")
    print("3. La API de Gemini no está habilitada para tu clave")
    print("\nSoluciones:")
    print("→ Visita: https://aistudio.google.com/apikey")
    print("→ Verifica tu cuota en: https://aistudio.google.com/")
    print("→ Genera una nueva clave API si es necesario")
