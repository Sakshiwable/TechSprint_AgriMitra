"""
Direct database query to show exactly what weather and news data we have
"""

import sys
from pathlib import Path
from pymongo import MongoClient
import json

sys.path.insert(0, str(Path(__file__).parent))
from config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client['techsprint']

print("\n" + "="*70)
print("WEATHER DATA IN DATABASE")
print("="*70)
weather_docs = list(db.weatherdata.find({}).limit(10))
for doc in weather_docs:
    doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
    print(json.dumps(doc, indent=2, default=str))
    print("-"*70)

print("\n" + "="*70)
print("NEWS DATA IN DATABASE (with demand signals)")
print("="*70)
news_docs = list(db.newsalerts.find({'demand_signals': {'$ne': []}}).limit(5))
for doc in news_docs:
    doc['_id'] = str(doc['_id'])
    print(f"Commodity: {doc.get('commodity')}")
    print(f"Headline: {doc.get('headline')}")
    print(f"Sentiment: {doc.get('sentiment')}")
    print(f"Signals: {doc.get('demand_signals')}")
    print("-"*70)

print("\n" + "="*70)
print("MARKET PRICES (sample)")
print("="*70)
market_docs = list(db.marketprices.find({}).limit(3))
for doc in market_docs:
    print(f"Commodity: {doc.get('commodity')}")
    print(f"State: {doc.get('state')}")
    print(f"Source: {doc.get('source')}")
    print(f"Modal Price: {doc.get('modal_price')}")
    print("-"*70)

client.close()
