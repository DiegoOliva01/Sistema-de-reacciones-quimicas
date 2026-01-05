import requests
import json

url = "http://localhost:8000/api/ai/explain-element/"
payload = {"symbol": "H"}
headers = {"Content-Type": "application/json"}

print("Haciendo POST a:", url)
print("Payload:", json.dumps(payload))
print()

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print()
    print("Response Body:")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
