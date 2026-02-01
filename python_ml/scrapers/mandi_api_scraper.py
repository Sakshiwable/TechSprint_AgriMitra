"""
Mandi Price Scraper using data.gov.in Official API
Source: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
"""

import requests
import time
from datetime import datetime
from pymongo import MongoClient
from config import (
    MONGO_URI, DATA_GOV_API_KEY, DATA_GOV_API_URL,
    COMMODITIES, SCRAPING_DELAY, MAX_RETRIES, REQUEST_TIMEOUT
)


class MandiAPIScraper:
    """
    Scraper for data.gov.in Mandi Price API
    Official government data source for APMC prices
    """
    
    def __init__(self):
        self.api_url = DATA_GOV_API_URL
        self.api_key = DATA_GOV_API_KEY
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']  # Match Node.js database name
        self.collection = self.db['marketprices']
    
    def fetch_prices(self, commodity=None, limit=100, offset=0):
        """
        Fetch prices from data.gov.in API
        
        Args:
            commodity: Specific commodity to fetch (None = all)
            limit: Number of records per page
            offset: Pagination offset
        
        Returns:
            List of price records
        """
        params = {
            'api-key': self.api_key,
            'format': 'json',
            'limit': limit,
            'offset': offset
        }
        
        # Add commodity filter if specified
        if commodity:
            params['filters[commodity]'] = commodity
        
        for attempt in range(MAX_RETRIES):
            try:
                print(f"  🔄 Fetching from data.gov.in API (attempt {attempt + 1}/{MAX_RETRIES})...")
                
                response = requests.get(
                    self.api_url,
                    params=params,
                    timeout=REQUEST_TIMEOUT
                )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract records from API response
                records = data.get('records', [])
                
                if records:
                    print(f"  ✅ Fetched {len(records)} records from API")
                    return records
                else:
                    print("  ⚠️ No records returned from API")
                    return []
                
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ API request failed (attempt {attempt + 1}): {e}")
                
                if attempt < MAX_RETRIES - 1:
                    wait_time = (attempt + 1) * 2  # Exponential backoff
                    print(f"  ⏳ Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    print("  ❌ Max retries reached, API fetch failed")
                    return []
        
        return []
    
    def normalize_record(self, record):
        """
        Normalize API response to MarketPrice schema
        
        Args:
            record: Raw API record
        
        Returns:
            Normalized price data dict
        """
        try:
            # Map API fields to our schema
            # Note: Actual field names depend on the API response structure
            # These are common field names, adjust based on actual API response
            
            commodity = record.get('commodity', record.get('Commodity', ''))
            state = record.get('state', record.get('State', ''))
            market = record.get('market', record.get('Market', ''))
            
            # Prices (handle various field name formats)
            modal_price = float(record.get('modal_price', record.get('Modal Price', 
                                record.get('modal', 0))))
            min_price = float(record.get('min_price', record.get('Min Price',
                            record.get('minimum', modal_price * 0.9))))
            max_price = float(record.get('max_price', record.get('Max Price',
                            record.get('maximum', modal_price * 1.1))))
            
            # Arrival quantity
            arrival = record.get('arrival_quantity', record.get('Arrivals', 0))
            if arrival:
                arrival = float(arrival)
            
            # Date parsing (try multiple formats)
            date_str = record.get('date', record.get('Date', record.get('arrival_date', '')))
            try:
                # Try common date formats
                for date_format in ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y']:
                    try:
                        date = datetime.strptime(date_str, date_format)
                        break
                    except ValueError:
                        continue
                else:
                    date = datetime.now()  # Fallback to current date
            except:
                date = datetime.now()
            
            return {
                'commodity': commodity.strip(),
                'state': state.strip(),
                'market': market.strip(),
                'modal_price': modal_price,
                'min_price': min_price,
                'max_price': max_price,
                'arrival_quantity': arrival,
                'date': date,
                'source': 'data.gov.in',
                'scraped_at': datetime.now(),
                'data_quality_score': 9  # High quality - official API
            }
        
        except Exception as e:
            print(f"  ⚠️ Error normalizing record: {e}")
            return None
    
    def save_to_db(self, prices):
        """Save normalized prices to MongoDB"""
        if not prices:
            return 0
        
        saved_count = 0
        for price_data in prices:
            try:
                # Update or insert (upsert based on commodity, market, date)
                filter_query = {
                    'commodity': price_data['commodity'],
                    'market': price_data['market'],
                    'date': price_data['date']
                }
                
                self.collection.update_one(
                    filter_query,
                    {'$set': price_data},
                    upsert=True
                )
                saved_count += 1
                
            except Exception as e:
                print(f"  ⚠️ Error saving record: {e}")
        
        print(f"  ✅ Saved {saved_count} records to database")
        return saved_count
    
    def run(self, commodity=None):
        """
        Main execution method
        
        Args:
            commodity: Specific commodity to scrape (None = all)
        
        Returns:
            Number of records saved
        """
        print(f"🌾 Running data.gov.in API Scraper...")
        
        if commodity:
            print(f"   Target: {commodity}")
        else:
            print(f"   Target: All commodities")
        
        # Fetch raw data
        raw_records = self.fetch_prices(commodity=commodity)
        
        if not raw_records:
            print("  ❌ No data fetched from API")
            return 0
        
        # Normalize records
        print("  📊 Normalizing data...")
        normalized_prices = []
        for record in raw_records:
            normalized = self.normalize_record(record)
            if normalized and normalized['commodity']:
                normalized_prices.append(normalized)
        
        print(f"  ✅ Normalized {len(normalized_prices)} records")
        
        # Save to database
        count = self.save_to_db(normalized_prices)
        
        # Rate limiting delay
        time.sleep(SCRAPING_DELAY)
        
        return count


if __name__ == "__main__":
    scraper = MandiAPIScraper()
    total = scraper.run()
    print(f"\n✅ Total records processed: {total}")
