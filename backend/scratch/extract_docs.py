import json
import os

file_path = r'C:\Users\my pc\.gemini\antigravity\brain\3da4a9dc-faa9-40f4-a5ad-97ece0ced7e3\.system_generated\steps\297\output.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    try:
        data = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        exit(1)

if 'documents' in data:
    for doc in data['documents']:
        print(doc['name'])
else:
    print("No documents found in JSON")
