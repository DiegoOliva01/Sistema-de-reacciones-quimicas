"""
Test rápido para verificar que la API está funcionando correctamente.
Ejecutar: python test_api_endpoint.py
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

from ai_service.gemini import gemini_service
from reactions.models import Reaction

print("=" * 60)
print("TEST DE ENDPOINT DE EXPLICACIÓN AI")
print("=" * 60)

# Check 1: Gemini service available
print("\n1. Verificando servicio Gemini...")
if gemini_service.is_available():
    print("   ✓ Gemini service disponible")
    print(f"   ✓ Modelo cargado: {gemini_service._model._model_name if gemini_service._model else 'No cargado'}")
else:
    print("   ✗ Gemini service NO disponible")
    sys.exit(1)

# Check 2: Get a sample reaction
print("\n2. Obteniendo reacción de prueba...")
try:
    reaction = Reaction.objects.filter(is_verified=True).first()
    if reaction:
        print(f"   ✓ Reacción encontrada: {reaction.name}")
        print(f"   - Ecuación: {reaction.equation}")
    else:
        print("   ✗ No hay reacciones verificadas en la BD")
        sys.exit(1)
except Exception as e:
    print(f"   ✗ Error: {e}")
    sys.exit(1)

# Check 3: Generate explanation
print("\n3. Generando explicación con Gemini...")
try:
    context = {
        'type': reaction.get_reaction_type_display() if hasattr(reaction, 'get_reaction_type_display') else 'Desconocido',
        'energy': reaction.get_energy_change_display() if hasattr(reaction, 'get_energy_change_display') else 'Desconocido',
        'difficulty': getattr(reaction, 'difficulty_level', 1),
        'educational_notes': getattr(reaction, 'educational_notes', ''),
    }
    
    result = gemini_service.explain_reaction(reaction.equation, context)
    
    if result.get('success'):
        print("   ✓ Explicación generada exitosamente!")
        print(f"   - Source: {result.get('source', 'unknown')}")
        print(f"   - Longitud: {len(result.get('explanation', ''))} caracteres")
        print(f"\n   Primeros 200 caracteres:")
        print(f"   {result.get('explanation', '')[:200]}...")
    else:
        print("   ✗ Falló la generación")
        print(f"   - Error: {result.get('error')}")
        if result.get('fallback'):
            print(f"   - Tiene fallback: Sí ({len(result.get('fallback'))} caracteres)")
except Exception as e:
    print(f"   ✗ Error: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TEST COMPLETADO")
print("=" * 60)
