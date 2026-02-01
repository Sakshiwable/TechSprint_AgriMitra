"""
Enhanced Mandi Price Scraper - Fetches ALL commodities from ALL states
Prioritizes Maharashtra APMCs
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import requests
import time
from datetime import datetime
from pymongo import MongoClient
from config import MONGO_URI, DATA_GOV_API_KEY, DATA_GOV_API_URL

class ComprehensiveMandiScraper:
    """
    Comprehensive scraper for all commodities across all states
    Prioritizes Maharashtra markets
    """
    
    def __init__(self):
        self.api_url = DATA_GOV_API_URL
        self.api_key = DATA_GOV_API_KEY
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']
        self.collection = self.db['marketprices']
        
        # Maharashtra APMCs to prioritize
        self.maharashtra_apmcs = [
            "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
            "Kolhapur", "Amravati", "Akola", "Latur", "Dhule", "Ahmednagar",
            "Jalgaon", "Nanded", "Sangli", "Parbhani", "Beed", "Yavatmal"
        ]
    
    def fetch_all_prices(self, limit=1000):
        """
        Fetch maximum number of price records from API
        """
        all_records = []
        offset = 0
        
        print(f"📥 Fetching comprehensive market data...")
        
        # Fetch multiple pages to get all available data
        for page in range(10):  # Fetch up to 10 pages
            try:
                params = {
                    'api-key': self.api_key,
                    'format': 'json',
                    'limit': limit,
                    'offset': offset
                }
                
                print(f"  🔄 Page {page + 1} (offset: {offset})...")
                
                response = requests.get(
                    self.api_url,
                    params=params,
                    timeout=30
                )
                
                response.raise_for_status()
                data = response.json()
                
                records = data.get('records', [])
                
                if not records:
                    print(f"  ℹ️ No more records found at offset {offset}")
                    break
                
                print(f"  ✅ Fetched {len(records)} records")
                all_records.extend(records)
                
                offset += limit
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                print(f"  ⚠️ Error fetching page {page + 1}: {e}")
                break
        
        print(f"\n📊 Total raw records fetched: {len(all_records)}")
        return all_records
    
    def normalize_record(self, record):
        """
        Normalize API record to schema
        """
        try:
            commodity = record.get('commodity', record.get('Commodity', '')).strip()
            state = record.get('state', record.get('State', '')).strip()
            district = record.get('district', record.get('District', '')).strip()
            market = record.get('market', record.get('Market', district)).strip()
            
            # Parse prices
            modal_price = self._safe_float(record.get('modal_price', record.get('modal', 0)))
            min_price = self._safe_float(record.get('min_price', record.get('minimum', modal_price * 0.9)))
            max_price = self._safe_float(record.get('max_price', record.get('maximum', modal_price * 1.1)))
            
            # Arrivals and traded quantity
            arrivals = self._safe_float(record.get('arrivals', record.get('Arrivals', 0)))
            traded = self._safe_float(record.get('traded_qty', record.get('Traded', 0)))
            
            # Parse date
            date_str = record.get('arrival_date', record.get('date', record.get('Date', '')))
            date = self._parse_date(date_str)
            
            # Unit
            unit = record.get('unit', record.get('Unit', 'Quintal')).strip()
            
            return {
                'commodity': commodity,
                'state': state,
                'district': district,
                'market': market,
                'modal_price': modal_price,
                'min_price': min_price,
                'max_price': max_price,
                'arrival_quantity': arrivals,
                'traded_quantity': traded,
                'unit': unit,
                'date': date,
                'source': 'data.gov.in',
                'scraped_at': datetime.now(),
                'data_quality_score': 9,
                'is_maharashtra': state.lower() == 'maharashtra'
            }
        
        except Exception as e:
            print(f"  ⚠️ Error normalizing record: {e}")
            return None
    
    def _safe_float(self, value):
        """Safely convert to float"""
        try:
            if value == '' or value is None:
                return 0
            return float(value)
        except:
            return 0
    
    def _parse_date(self, date_str):
        """Parse date from various formats"""
        if not date_str:
            return datetime.now()
        
        formats = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d']
        for fmt in formats:
            try:
                return datetime.strptime(str(date_str), fmt)
            except:
                continue
        return datetime.now()
    
    def save_to_db(self, prices):
        """Save to database with upsert"""
        if not prices:
            return 0
        
        saved_count = 0
        updated_count = 0
        
        for price_data in prices:
            try:
                filter_query = {
                    'commodity': price_data['commodity'],
                    'market': price_data['market'],
                    'state': price_data['state'],
                    'date': price_data['date']
                }
                
                result = self.collection.update_one(
                    filter_query,
                    {'$set': price_data},
                    upsert=True
                )
                
                if result.upserted_id:
                    saved_count += 1
                elif result.modified_count > 0:
                    updated_count += 1
                    
            except Exception as e:
                print(f"  ⚠️ Error saving: {e}")
        
        print(f"  ✅ Saved: {saved_count} new, Updated: {updated_count}")
        return saved_count + updated_count
    
    def run(self):
        """Main execution"""
        print("=" * 70)
        print("🌾 COMPREHENSIVE MANDI PRICE SCRAPER")
        print("=" * 70)
        print("Target: ALL commodities, ALL states")
        print("Priority: Maharashtra APMCs")
        print("=" * 70)
        
        # Fetch all data
        raw_records = self.fetch_all_prices()
        
        if not raw_records:
            print("❌ No data fetched")
            return 0
        
        # Normalize
        print("\n📊 Normalizing data...")
        normalized = []
        maharashtra_count = 0
        
        for record in raw_records:
            norm = self.normalize_record(record)
            if norm and norm['commodity']:
                normalized.append(norm)
                if norm['is_maharashtra']:
                    maharashtra_count += 1
        
        print(f"  ✅ Normalized: {len(normalized)} records")
        print(f"  🎯 Maharashtra records: {maharashtra_count}")
        
        # Sort to prioritize Maharashtra
        normalized.sort(key=lambda x: (not x['is_maharashtra'], x['commodity']))
        
        # Save
        print("\n💾 Saving to database...")
        count = self.save_to_db(normalized)
        
        # Summary
        print("\n" + "=" * 70)
        print("✅ SCRAPING COMPLETE!")
        print(f"Total records processed: {count}")
        print(f"Maharashtra records: {maharashtra_count}")
        
        # Show state distribution
        states = {}
        for record in normalized:
            state = record['state']
            states[state] = states.get(state, 0) + 1
        
        print(f"\n📍 State Distribution:")
        for state, count in sorted(states.items(), key=lambda x: -x[1])[:10]:
            print(f"  {state}: {count} records")
        
        print("=" * 70)
        
        return count


if __name__ == "__main__":
    scraper = ComprehensiveMandiScraper()
    scraper.run()
