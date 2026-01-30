import json
from pymongo import MongoClient
import os
from datetime import datetime
from dotenv import load_dotenv
import pathlib

# Load .env info
env_path = pathlib.Path(__file__).parent.parent / "server" / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ MONGO_URI not found! Checking fallback...")
    MONGO_URI = "mongodb://localhost:27017/techsprint"

print(f"📡 Connecting to DB: {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else 'Localhost'}...")

try:
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    collection = db["schemes"]
    
    # Load JSON
    with open("scraped_schemes.json", "r", encoding="utf-8") as f:
        schemes = json.load(f)

    count = 0
    for item in schemes:
        # Check duplicate by title
        if not collection.find_one({"title": item['title']}):
            category = item['tags'][0] if item.get('tags') else "Agriculture"
            
            scheme_doc = {
                "title": item['title'],
                "description": item['description'],
                "category": category, 
                "link": item['link'],
                "verified": False, # Important: Pending Verification
                "source": "MyScheme Scraper",
                "state": "All India", # Default
                "eligibility": "Check official portal details",
                "benefits": "See scheme link for full benefits",
                "deadline": "Open",
                "createdAt": datetime.utcnow()
            }
            collection.insert_one(scheme_doc)
            print(f"✅ IMPORTED: {item['title']}")
            count += 1
        else:
            print(f"🔹 SKIPPED (Exists): {item['title']}")

    print(f"\nExample Data Check:")
    print(f"Total New Imports: {count}")
    print(f"Total Pending Verification Schemes in DB: {collection.count_documents({'verified': False})}")

except Exception as e:
    print(f"❌ Error during import: {e}")
