"""
Run comprehensive market data scraping
This script fetches all available market data from multiple sources
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from scrapers.mandi_api_scraper import MandiAPIScraper
from scrapers.demo_scraper import DemoMarketScraper
import time

def main():
    print("=" * 80)
    print("🌾 AGRIMITRA - COMPREHENSIVE MARKET DATA SCRAPER")
    print("=" * 80)
    
    total_records = 0
    
    # Method 1: Try API scraper first
    print("\n📡 Method 1: Fetching from data.gov.in API...")
    try:
        api_scraper = MandiAPIScraper()
        
        # Fetch multiple batches
        for offset in [0, 100, 200, 300, 400, 500]:
            print(f"\n  Batch starting at offset {offset}...")
            count = api_scraper.fetch_prices(limit=100, offset=offset)
            if count:
                total_records += count
                time.sleep(2)  # Rate limiting
            else:
                print(f"  No more data at offset {offset}, stopping")
                break
    except Exception as e:
        print(f"  ⚠️ API scraping failed: {e}")
    
    print(f"\n✅ API Scraping complete: {total_records} records")
    
    # Method 2: Add demo data for better coverage
    if total_records < 50:
        print("\n🎲 Method 2: Generating demo data for better coverage...")
        try:
            demo_scraper = DemoMarketScraper()
            demo_scraper.run()
            print("  ✅ Demo data added")
        except Exception as e:
            print(f"  ⚠️ Demo generation failed: {e}")
    
    print("\n" + "=" * 80)
    print("✅ SCRAPING COMPLETE!")
    print(f"Total records processed: {total_records}+")
    print("=" * 80)
    print("\n💡 Tip: Data is now available in the Market Prices page!")
    print("   Navigate to http://localhost:5173/market-prices to view\n")

if __name__ == "__main__":
    main()
