"""
Clean old demo data and re-populate with real scraped data
"""

import sys
from pathlib import Path
from pymongo import MongoClient
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import MONGO_URI

def clear_old_data():
    """Remove old demo data from database"""
    print("="*60)
    print("🧹 CLEARING OLD DATA")
    print("="*60)
    
    client = MongoClient(MONGO_URI)
    db = client['techsprint']
    
    # Count existing records
    market_count = db.marketprices.count_documents({})
    weather_count = db.weatherdata.count_documents({})
    news_count = db.newsalerts.count_documents({})
    
    print(f"\n📊 Current Data:")
    print(f"   Market Prices: {market_count}")
    print(f"   Weather Data: {weather_count}")
    print(f"   News Alerts: {news_count}")
    
    # Delete all records
    print("\n🗑️  Deleting all records...")
    db.marketprices.delete_many({})
    db.weatherdata.delete_many({})
    db.newsalerts.delete_many({})
    
    print("✅ All old data cleared!\n")
    
    client.close()

def main():
    print("\n" + "#"*60)
    print("# RESET DATABASE AND FETCH FRESH DATA")
    print("#"*60 + "\n")
    
    # Clear old data
    clear_old_data()
    
    # Run aggregator
    print("="*60)
    print("🔄 RUNNING DATA AGGREGATOR")
    print("="*60 + "\n")
    
    import subprocess
    result = subprocess.run(
        [sys.executable, "scrapers/data_aggregator.py"],
        cwd=Path(__file__).parent
    )
    
    if result.returncode == 0:
        print("\n" + "="*60)
        print("✅ SUCCESS - Database Updated!")
        print("="*60)
        print("\n🌐 Refresh your browser:")
        print("   http://localhost:5173/market-prices\n")
    else:
        print("\n❌ Error running aggregator")

if __name__ == "__main__":
    main()
