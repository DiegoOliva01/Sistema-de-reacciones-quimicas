"""
Simple test to warm up Ollama and test the integration.
"""
import requests
import json
import time

print("Calentando Ollama con una consulta simple...")
try:
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": "Hola",
        "stream": False,
        "options": {
            "num_predict": 10  # Solo 10 tokens
        }
    }
    
    print("Enviando request a Ollama...")
    start = time.time()
    response = requests.post(url, json=payload, timeout=120)
    elapsed = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Ollama respondió en {elapsed:.1f}s")
        print(f"  Respuesta: {data.get('response', '')}")
    else:
        print(f"✗ Error código {response.status_code}")
        
except Exception as e:
    print(f"✗ Error: {e}")

print()
print("Ahora probando con el backend Django...")
try:
    url = "http://localhost:8000/api/ai/explain-element/"
    payload = {"symbol": "H"}
    
    print("Enviando request al backend...")
    start = time.time()
    response = requests.post(url, json=payload, timeout=120)
    elapsed = time.time() - start
    
    print(f"Status: {response.status_code} (en {elapsed:.1f}s)")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print(f"✓ Éxito! Fuente: {data.get('source')}")
            print()
            print("Explicación:")
            print(data.get('explanation', '')[:300] + "...")
        else:
            print(f"✗ Error: {data.get('error')}")
    else:
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"✗ Error: {e}")
