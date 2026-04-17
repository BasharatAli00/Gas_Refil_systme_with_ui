import httpx
import json

def test_chat():
    url = "http://localhost:8000/chat"
    payload = {"message": "Who is next to fill the gas?"}
    try:
        response = httpx.post(url, json=payload, timeout=30.0)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()
