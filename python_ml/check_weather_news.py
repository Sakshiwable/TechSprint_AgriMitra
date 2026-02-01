"""
Check what weather and news data is actually in the database
"""

import sys
from pathlib import Path
from pymongo import MongoClient

sys.path.insert(0, str(Path(__file__).parent))
from config import MONGO_URI

def check_data():
    client = MongoClient(MONGO_URI)
    db = client['techsprint']
    
    print("="*70)
    print("🔍 CHECKING WEATHER & NEWS DATA IN DATABASE")
    print("="*70)
    
    # Check market prices and their states
    print("\n📊 MARKET PRICES - States Present:")
    states = db.marketprices.distinct('state')
    print(f"   Found {len(states)} unique states:")
    for state in sorted(states):
        count = db.marketprices.count_documents({'state': state})
        print(f"   - {state}: {count} records")
    
    # Check weather data
    print("\n🌤️ WEATHER DATA:")
    weather_count = db.weatherdata.count_documents({})
    print(f"   Total records: {weather_count}")
    
    if weather_count > 0:
        weather_states = list(db.weatherdata.find({}, {'state': 1, 'city': 1, 'temperature': 1, 'weather_description': 1}))
        print(f"   States with weather:")
        for w in weather_states:
            print(f"   - {w.get('state')}: {w.get('city')} ({w.get('temperature')}°C, {w.get('weather_description')})")
    else:
        print("   ⚠️ No weather data found!")
    
    # Check news data
    print("\n📰 NEWS DATA:")
    news_count = db.newsalerts.count_documents({})
    print(f"   Total news items: {news_count}")
    
    if news_count > 0:
        # Group by commodity
        commodities = db.newsalerts.distinct('commodity')
        print(f"   Commodities with news:")
        for commodity in sorted(commodities):
            count = db.newsalerts.count_documents({'commodity': commodity})
            # Check for demand signals
            with_signals = db.newsalerts.count_documents({
                'commodity': commodity,
                'demand_signals': {'$exists': True, '$ne': []}
            })
            print(f"   - {commodity}: {count} items ({with_signals} with demand signals)")
            
            # Show sample with demand signals
            if with_signals > 0:
                sample = db.newsalerts.find_one({
                    'commodity': commodity,
                    'demand_signals': {'$exists': True, '$ne': []}
                })
                print(f"     Sample: {sample.get('headline')[:60]}...")
                print(f"     Signals: {sample.get('demand_signals')}")
                print(f"     Sentiment: {sample.get('sentiment')}")
    else:
        print("   ⚠️ No news data found!")
    
    print("\n" + "="*70)
    print("💡 ANALYSIS:")
    print("="*70)
    
    # Compare states
    market_states_set = set(states)
    weather_states_set = set([w.get('state') for w in db.weatherdata.find({}, {'state': 1})])
    
    print(f"\n🔍 State Matching:")
    print(f"   Market prices have data for: {sorted(market_states_set)}")
    print(f"   Weather data exists for: {sorted(weather_states_set)}")
    
    missing_weather = market_states_set - weather_states_set
    if missing_weather:
        print(f"   ⚠️ States in market data but NO weather: {sorted(missing_weather)}")
    
    matches = market_states_set & weather_states_set
    if matches:
        print(f"   ✅ States with BOTH market & weather: {sorted(matches)}")
    
    client.close()

if __name__ == "__main__":
    check_data()
