"""
Quick test script to populate database with real market data
Run this to test the data aggregation pipeline
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from scrapers.demo_scraper import DemoMarketScraper

def main():
    print("="*60)
    print("🌾 Running Quick Data Population Test")
    print("="*60)
    print("\nThis will populate the database with demo market data")
    print("In production, replace this with real API/scraper calls\n")
    
    scraper = DemoMarketScraper()
    count = scraper.run()
    
    print("\n" + "="*60)
    print(f"✅ Successfully added {count} price records")
    print("="*60)
    print("\n📊 You can now:")
    print("  1. Visit: http://localhost:5173/market-prices")
    print("  2. Select a commodity to see price trends")
    print("  3. Check the auto-refresh (every 5 minutes)")
    print("\n💡 To add real data, run:")
    print("  python scrapers/data_aggregator.py")
    print()

if __name__ == "__main__":
    main()
