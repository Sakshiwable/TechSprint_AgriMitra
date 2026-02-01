# Demo data generator - run multiple times to build historical data
import sys
sys.path.append('.')
from scrapers.demo_scraper import DemoMarketScraper

scraper = DemoMarketScraper()
for i in range(10):
    print(f"\n📊 Run {i+1}/10")
    scraper.run()
    print(f"✅ Batch {i+1} complete")

print("\n🎉 Generated sufficient data for training!")
