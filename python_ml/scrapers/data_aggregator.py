"""
Data Aggregator - Orchestrates all data sources
Priority: data.gov.in API > eNAM Scraper > with Weather & News enrichment
"""

import sys
from pathlib import Path
from datetime import datetime
from pymongo import MongoClient

# Add parent directory to path to import config
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import MONGO_URI, COMMODITIES, STATES
from scrapers.mandi_api_scraper import MandiAPIScraper
from scrapers.enam_scraper import EnamScraper
from services.weather_service import WeatherService
from services.news_parser import NewsParser
import time


class DataAggregator:
    """
    Aggregates market data from multiple sources with priority ordering
    1. data.gov.in API (primary, official)
    2. eNAM scraper (backup)
    3. Weather enrichment
    4. News sentiment analysis
    """
    
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']  # Match Node.js database name
        self.market_collection = self.db['marketprices']
        
        # Initialize scrapers and services
        self.api_scraper = MandiAPIScraper()
        self.enam_scraper = EnamScraper()
        self.weather_service = WeatherService()
        self.news_parser = NewsParser()
    
    def collect_market_data(self, commodity=None):
        """
        Collect market price data from all sources
        
        Args:
            commodity: Specific commodity (None = all)
        
        Returns:
            Statistics dict
        """
        print(f"\n{'='*60}")
        print(f"📊 MARKET DATA COLLECTION - {commodity or 'All Commodities'}")
        print(f"{'='*60}\n")
        
        stats = {
            'api_records': 0,
            'enam_records': 0,
            'total_market_records': 0
        }
        
        # Step 1: Try data.gov.in API (Primary source)
        print("🔵 Step 1: data.gov.in API (Primary Source)")
        print("-" * 60)
        try:
            api_count = self.api_scraper.run(commodity=commodity)
            stats['api_records'] = api_count
            print(f"✅ API fetch complete: {api_count} records\n")
        except Exception as e:
            print(f"❌ API scraper failed: {e}\n")
        
        # Step 2: eNAM Scraper (Backup source)
        print("🟢 Step 2: eNAM Scraper (Backup Source)")
        print("-" * 60)
        try:
            # Only run eNAM if API didn't return enough data
            if stats['api_records'] < 10:
                print("⚠️ Low API data, running eNAM scraper as backup...")
                if commodity:
                    enam_count = self.enam_scraper.run(commodities=[commodity])
                else:
                    enam_count = self.enam_scraper.run()
                stats['enam_records'] = enam_count
                print(f"✅ eNAM scrape complete: {enam_count} records\n")
            else:
                print("ℹ️ Sufficient API data, skipping eNAM scraper\n")
        except Exception as e:
            print(f"❌ eNAM scraper failed: {e}\n")
        
        stats['total_market_records'] = stats['api_records'] + stats['enam_records']
        
        return stats
    
    def enrich_with_weather(self, states=None):
        """
        Collect weather data for price correlation
        
        Args:
            states: List of states (None = all)
        
        Returns:
            Number of weather records
        """
        print("🌤️ Step 3: Weather Data Collection")
        print("-" * 60)
        
        try:
            weather_count = self.weather_service.run(states=states)
            print(f"✅ Weather collection complete: {weather_count} records\n")
            return weather_count
        except Exception as e:
            print(f"❌ Weather service failed: {e}\n")
            return 0
    
    def enrich_with_news(self, commodities=None):
        """
        Collect news and demand signals
        
        Args:
            commodities: List of commodities (None = all)
        
        Returns:
            Number of news items
        """
        print("📰 Step 4: News & Demand Signals")
        print("-" * 60)
        
        try:
            news_count = self.news_parser.run(commodities=commodities)
            print(f"✅ News collection complete: {news_count} items\n")
            return news_count
        except Exception as e:
            print(f"❌ News parser failed: {e}\n")
            return 0
    
    def validate_data_quality(self):
        """
        Validate data quality and remove outliers
        
        Returns:
            Validation stats
        """
        print("🔍 Step 5: Data Quality Validation")
        print("-" * 60)
        
        stats = {
            'total_records': 0,
            'invalid_records': 0,
            'outliers': 0
        }
        
        try:
            # Get all recent market records (last 24 hours)
            from datetime import timedelta
            cutoff = datetime.now() - timedelta(hours=24)
            
            records = list(self.market_collection.find({
                'scraped_at': {'$gte': cutoff}
            }))
            
            stats['total_records'] = len(records)
            
            # Validate each record
            for record in records:
                is_valid = True
                
                # Check for required fields
                if not record.get('commodity') or not record.get('modal_price'):
                    is_valid = False
                
                # Check price ranges (reasonable values)
                modal_price = record.get('modal_price', 0)
                
                # Define reasonable price ranges per quintal (in INR)
                price_ranges = {
                    'Tomato': (200, 5000),
                    'Onion': (300, 6000),
                    'Potato': (300, 4000),
                    'Wheat': (1500, 3500),
                    'Rice': (2000, 5000),
                    'Cotton': (4000, 10000)
                }
                
                commodity = record.get('commodity', '')
                if commodity in price_ranges:
                    min_price, max_price = price_ranges[commodity]
                    if not (min_price <= modal_price <= max_price):
                        is_valid = False
                        stats['outliers'] += 1
                
                # Mark invalid records
                if not is_valid:
                    stats['invalid_records'] += 1
                    # Optionally: mark or delete invalid records
                    # self.market_collection.update_one(
                    #     {'_id': record['_id']},
                    #     {'$set': {'is_valid': False}}
                    # )
            
            print(f"  Total records validated: {stats['total_records']}")
            print(f"  Invalid records: {stats['invalid_records']}")
            print(f"  Price outliers: {stats['outliers']}")
            print(f"  Valid records: {stats['total_records'] - stats['invalid_records']}\n")
            
        except Exception as e:
            print(f"  ⚠️ Validation error: {e}\n")
        
        return stats
    
    def generate_summary_report(self, stats, weather_count, news_count):
        """Generate and print summary report"""
        print(f"\n{'='*60}")
        print(f"📋 COLLECTION SUMMARY REPORT")
        print(f"{'='*60}\n")
        print(f"🔵 Market Data:")
        print(f"   • data.gov.in API: {stats['api_records']} records")
        print(f"   • eNAM Scraper: {stats['enam_records']} records")
        print(f"   • Total Market Records: {stats['total_market_records']}")
        print(f"\n🌤️ Weather Data: {weather_count} records")
        print(f"📰 News Articles: {news_count} items")
        print(f"\n{'='*60}\n")
    
    def run_full_collection(self, commodity=None, states=None):
        """
        Run complete data aggregation pipeline
        
        Args:
            commodity: Specific commodity (None = all)
            states: Specific states (None = all)
        
        Returns:
            Complete statistics dict
        """
        start_time = datetime.now()
        
        print(f"\n{'#'*60}")
        print(f"🌾 AGRIMITRA DATA AGGREGATION PIPELINE")
        print(f"{'#'*60}\n")
        print(f"⏰ Started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        # Collect market data
        market_stats = self.collect_market_data(commodity=commodity)
        
        # Enrich with weather
        weather_count = self.enrich_with_weather(states=states)
        
        # Enrich with news
        target_commodities = [commodity] if commodity else None
        news_count = self.enrich_with_news(commodities=target_commodities)
        
        # Validate data quality
        validation_stats = self.validate_data_quality()
        
        # Generate summary
        self.generate_summary_report(market_stats, weather_count, news_count)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"⏱️ Completed in: {duration:.2f} seconds")
        print(f"✅ Pipeline execution successful!\n")
        
        return {
            'market': market_stats,
            'weather': weather_count,
            'news': news_count,
            'validation': validation_stats,
            'duration': duration
        }


def main():
    """Main entry point"""
    aggregator = DataAggregator()
    
    # Parse command line arguments
    commodity = None
    if len(sys.argv) > 1 and not sys.argv[1].startswith('--'):
        commodity = sys.argv[1]
    
    # Run full collection
    results = aggregator.run_full_collection(commodity=commodity)
    
    print(f"🎉 Data aggregation complete!")
    print(f"💡 Data is now available in MongoDB")
    print(f"🚀 Refresh your browser at: http://localhost:5173/market-prices\n")


if __name__ == "__main__":
    main()
