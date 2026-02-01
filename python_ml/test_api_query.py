from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['techsprint']

# Replicate the exact query from the API
days = 30
startDate = datetime.now() - timedelta(days=days)

# This is the EXACT query from getAllDemandSignals endpoint
query = {
    'fetched_at': {'$gte': startDate},
    'demand_signals': {'$exists': True, '$ne': []}
}

print(f"Query: {query}")
print(f"Start date: {startDate}")
print(f"Current date: {datetime.now()}")

news = list(db.newsalerts.find(query).sort('fetched_at', -1).limit(100))

print(f"\nFound {len(news)} news items matching the query")

if news:
    print("\nFirst 3 items:")
    for i, item in enumerate(news[:3], 1):
        print(f"\n{i}. {item.get('headline')}")
        print(f"   Commodity: {item.get('commodity')}")
        print(f"   Signals: {item.get('demand_signals')}")
        print(f"   Sentiment: {item.get('sentiment')}")
        print(f"   Fetched at: {item.get('fetched_at')}")
        print(f"   URL: {item.get('url')}")
else:
    print("\n⚠️ No items found!")
    
    # Debug: Check what dates are in the database
    all_news = list(db.newsalerts.find({}).limit(5))
    print(f"\nChecking first 5 items in DB:")
    for item in all_news:
        print(f"  - fetched_at: {item.get('fetched_at')}, published_at: {item.get('published_at')}")
