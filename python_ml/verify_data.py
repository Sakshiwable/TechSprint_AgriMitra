"""
Quick verification script to check database contents
"""

import sys
from pathlib import Path
from pymongo import MongoClient
from datetime import datetime, timedelta

sys.path.insert(0, str(Path(__file__).parent))
from config import MONGO_URI

def verify_data():
    client = MongoClient(MONGO_URI)
    db = client['techsprint']
    
    print("="*60)
    print("📊 DATABASE VERIFICATION")
    print("="*60)
    
    # Check market prices
    market_count = db.marketprices.count_documents({})
    print(f"\n✅ Market Prices: {market_count} records")
    
    if market_count > 0:
        # Show sample
        sample = db.marketprices.find_one()
        print(f"   Sample:")
        print(f"   - Commodity: {sample.get('commodity')}")
        print(f"   - State: {sample.get('state')}")
        print(f"   - Market: {sample.get('market')}")
        print(f"   - Modal Price: ₹{sample.get('modal_price')}")
        print(f"   - Source: {sample.get('source')}")
        print(f"   - Scraped: {sample.get('scraped_at')}")
        print(f"   - Quality Score: {sample.get('data_quality_score', 'N/A')}")
        
        # Count by source
        sources = db.marketprices.aggregate([
            {"$group": {"_id": "$source", "count": {"$sum": 1}}}
        ])
        print(f"\n   By Source:")
        for src in sources:
            print(f"   - {src['_id']}: {src['count']} records")
    
    # Check weather
    weather_count = db.weatherdata.count_documents({})
    print(f"\n✅ Weather Data: {weather_count} records")
    
    if weather_count > 0:
        sample = db.weatherdata.find_one()
        print(f"   Sample:")
        print(f"   - State: {sample.get('state')}")
        print(f"   - City: {sample.get('city')}")
        print(f"   - Temperature: {sample.get('temperature')}°C")
        print(f"   - Condition: {sample.get('weather_description')}")
    
    # Check news
    news_count = db.newsalerts.count_documents({})
    print(f"\n✅ News Alerts: {news_count} items")
    
    if news_count > 0:
        sample = db.newsalerts.find_one()
        print(f"   Sample:")
        print(f"   - Commodity: {sample.get('commodity')}")
        print(f"   - Headline: {sample.get('headline')[:60]}...")
        print(f"   - Sentiment: {sample.get('sentiment')}")
        print(f"   - Signals: {sample.get('demand_signals')}")
    
    print("\n" + "="*60)
    print("✅ VERIFICATION COMPLETE")
    print("="*60)
    print(f"\nAll data is in the 'techsprint' database")
    print(f"Backend is also connected to 'techsprint'")
    print(f"\n🌐 Visit: http://localhost:5173/market-prices")
    print()
    
    client.close()

if __name__ == "__main__":
    verify_data()
