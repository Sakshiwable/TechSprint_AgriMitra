from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

client = MongoClient(os.getenv('MONGO_URI'))
db = client['techsprint']

# Check recent news
startDate = datetime.now() - timedelta(days=30)

count_with_signals = db.newsalerts.count_documents({
    'fetched_at': {'$gte': startDate},
    'demand_signals': {'$exists': True, '$ne': []}
})

count_total_recent = db.newsalerts.count_documents({
    'fetched_at': {'$gte': startDate}
})

count_total = db.newsalerts.count_documents({})

print(f'Total news items: {count_total}')
print(f'Total recent (30 days): {count_total_recent}')
print(f'With demand signals (30 days): {count_with_signals}')

# Check a sample
sample = db.newsalerts.find_one({})
if sample:
    print(f'\nSample news item:')
    print(f'  - Commodity: {sample.get("commodity")}')
    print(f'  - Headline: {sample.get("headline")}')
    print(f'  - Has fetched_at: {"fetched_at" in sample}')
    print(f'  - fetched_at: {sample.get("fetched_at")}')
    print(f'  - Has demand_signals: {"demand_signals" in sample}')
    print(f'  - demand_signals: {sample.get("demand_signals")}')
    print(f'  - Sentiment: {sample.get("sentiment")}')

# Get one with demand signals
sample_with_signals = db.newsalerts.find_one({'demand_signals': {'$exists': True, '$ne': []}})
if sample_with_signals:
    print(f'\nSample WITH demand signals:')
    print(f'  - Commodity: {sample_with_signals.get("commodity")}')
    print(f'  - Headline: {sample_with_signals.get("headline")}')
    print(f'  - demand_signals: {sample_with_signals.get("demand_signals")}')
    print(f'  - fetched_at: {sample_with_signals.get("fetched_at")}')
