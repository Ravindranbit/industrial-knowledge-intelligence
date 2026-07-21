import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test():
    file_path = os.path.join("..", "data", "raw", "ashrae_tc9.9_guidelines.txt")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print(f"Read {len(content)} bytes from {file_path}")
    print("Sending to /ingest/text endpoint (this will take a while for LLM extraction and embeddings)...")
    
    # We need to trigger the startup events to init the DB
    with TestClient(app) as client:
        response = client.post(
            "/ingest/text",
            data={
                "title": "ASHRAE TC9.9 Guidelines",
                "doc_type": "manual",
                "text": content
            }
        )
        
        print(f"Status Code: {response.status_code}")
        try:
            print("Response JSON:")
            import json
            print(json.dumps(response.json(), indent=2))
        except:
            print("Response text:", response.text)

if __name__ == "__main__":
    run_test()
