"""
Test script to verify Ollama integration with the backend.
"""
import requests
import json

# Test 1: Check if Ollama is running
print("=" * 60)
print("TEST 1: Verificando que Ollama esté corriendo...")
print("=" * 60)
try:
    response = requests.get("http://localhost:11434/api/tags", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print("✓ Ollama está corriendo")
        print(f"  Modelos disponibles: {[m['name'] for m in data.get('models', [])]}")
    else:
        print(f"✗ Error: Ollama respondió con código {response.status_code}")
except Exception as e:
    print(f"✗ Error conectando con Ollama: {e}")

print()

# Test 2: Test the explain-element endpoint
print("=" * 60)
print("TEST 2: Probando endpoint de explicación de elemento...")
print("=" * 60)
try:
    url = "http://localhost:8000/api/ai/explain-element/"
    payload = {"symbol": "H"}
    headers = {"Content-Type": "application/json"}
    
    print(f"Haciendo POST a {url}")
    print(f"Payload: {payload}")
    
    response = requests.post(url, json=payload, headers=headers, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print()
    print("Response Body:")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        if data.get('success'):
            print()
            print("✓ Explicación generada exitosamente")
            print(f"  Fuente: {data.get('source', 'unknown')}")
        else:
            print()
            print(f"✗ Error: {data.get('error', 'Unknown error')}")
    except:
        print(response.text)
        
except Exception as e:
    print(f"✗ Error: {e}")

print()

# Test 3: Test Ollama generation directly
print("=" * 60)
print("TEST 3: Probando generación directa con Ollama...")
print("=" * 60)
try:
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": "Explica brevemente qué es el Hidrógeno en química.",
        "stream": False
    }
    
    print(f"Haciendo POST a {url}")
    response = requests.post(url, json=payload, timeout=30)
    
    if response.status_code == 200:
        data = response.json()
        print("✓ Ollama generó una respuesta")
        print()
        print("Respuesta:")
        print(data.get('response', '')[:500] + "...")
    else:
        print(f"✗ Error: código {response.status_code}")
        
except Exception as e:
    print(f"✗ Error: {e}")
