"""
eNAM Web Scraper (Backup for when API is unavailable)
Source: https://enam.gov.in/web/dashboard/trade-data
"""

import requests
from bs4 import BeautifulSoup
import time
from datetime import datetime
from pymongo import MongoClient
from config import (
    MONGO_URI, ENAM_DASHBOARD_URL,
    COMMODITIES, SCRAPING_DELAY, MAX_RETRIES, REQUEST_TIMEOUT
)


class EnamScraper:
    """
    Web scraper for eNAM dashboard
    Backup data source when API is unavailable
    """
    
    def __init__(self):
        self.base_url = ENAM_DASHBOARD_URL
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']  # Match Node.js database name
        self.collection = self.db['marketprices']
        
        # User agent to avoid being blocked
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    def scrape_commodity(self, commodity):
        """
        Scrape price data for a specific commodity from eNAM
        
        Args:
            commodity: Commodity name to scrape
        
        Returns:
            List of price records
        """
        print(f"  🕷️ Scraping {commodity} from eNAM...")
        
        prices = []
        
        for attempt in range(MAX_RETRIES):
            try:
                # Make request to eNAM dashboard
                response = requests.get(
                    self.base_url,
                    headers=self.headers,
                    timeout=REQUEST_TIMEOUT
                )
                
                response.raise_for_status()
                
                # Parse HTML
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find price data tables/cards
                # NOTE: These selectors are generic - need to be updated based on actual website structure
                # Common patterns to look for:
                # - Tables with class containing 'price', 'market', 'trade'
                # - Cards/divs with commodity information
                
                # Try to find table rows
                price_rows = soup.find_all('tr', class_=lambda x: x and ('price' in x.lower() or 'trade' in x.lower()))
                
                if not price_rows:
                    # Try alternative: find all tables and search within them
                    tables = soup.find_all('table')
                    for table in tables:
                        rows = table.find_all('tr')[1:]  # Skip header
                        price_rows.extend(rows)
                
                # Parse each row
                for row in price_rows:
                    try:
                        cells = row.find_all(['td', 'th'])
                        
                        if len(cells) >= 5:  # Typical: Commodity, Market, Min, Max, Modal
                            row_commodity = cells[0].get_text(strip=True)
                            
                            # Check if this row matches our commodity
                            if commodity.lower() in row_commodity.lower():
                                # Extract data (adjust indices based on actual table structure)
                                market = cells[1].get_text(strip=True)
                                
                                # Try to extract prices (handle various formats)
                                try:
                                    min_price = float(cells[2].get_text(strip=True).replace(',', '').replace('₹', ''))
                                    max_price = float(cells[3].get_text(strip=True).replace(',', '').replace('₹', ''))
                                    modal_price = float(cells[4].get_text(strip=True).replace(',', '').replace('₹', ''))
                                    
                                    price_record = {
                                        'commodity': commodity,
                                        'market': market,
                                        'min_price': min_price,
                                        'max_price': max_price,
                                        'modal_price': modal_price,
                                        'date': datetime.now(),
                                        'source': 'eNAM',
                                        'scraped_at': datetime.now(),
                                        'data_quality_score': 7  # Good quality - government website
                                    }
                                    
                                    # Try to extract state from market name
                                    state = self.extract_state(market)
                                    if state:
                                        price_record['state'] = state
                                    else:
                                        price_record['state'] = 'Unknown'
                                    
                                    prices.append(price_record)
                                
                                except (ValueError, IndexError) as e:
                                    continue  # Skip rows with invalid price data
                    
                    except Exception as e:
                        continue  # Skip problematic rows
                
                if prices:
                    print(f"  ✅ Scraped {len(prices)} records from eNAM")
                    return prices
                else:
                    print(f"  ⚠️ No data found for {commodity} (attempt {attempt + 1}/{MAX_RETRIES})")
                    
                    if attempt < MAX_RETRIES - 1:
                        time.sleep(SCRAPING_DELAY * 2)
            
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ Request failed: {e}")
                
                if attempt < MAX_RETRIES - 1:
                    wait_time = (attempt + 1) * 3
                    print(f"  ⏳ Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
        
        print(f"  ❌ Failed to scrape {commodity} after {MAX_RETRIES} attempts")
        return []
    
    def extract_state(self, market_name):
        """
        Extract state name from market name
        
        Args:
            market_name: Market/APMC name
        
        Returns:
            State name or None
        """
        state_patterns = [
            'Maharashtra', 'Gujarat', 'Karnataka', 'Uttar Pradesh', 'Punjab',
            'Haryana', 'Rajasthan', 'Madhya Pradesh', 'Tamil Nadu', 'Telangana',
            'Andhra Pradesh', 'West Bengal', 'Bihar', 'Odisha', 'Kerala'
        ]
        
        for state in state_patterns:
            if state.lower() in market_name.lower():
                return state
        
        return None
    
    def save_to_db(self, prices):
        """Save scraped prices to MongoDB"""
        if not prices:
            return 0
        
        saved_count = 0
        for price_data in prices:
            try:
                # Upsert to avoid duplicates
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
    
    def run(self, commodities=None):
        """
        Main execution method
        
        Args:
            commodities: List of commodities to scrape (None = all)
        
        Returns:
            Total number of records saved
        """
        print(f"🕷️ Running eNAM Web Scraper...")
        
        target_commodities = commodities if commodities else COMMODITIES
        total_saved = 0
        
        for commodity in target_commodities:
            prices = self.scrape_commodity(commodity)
            count = self.save_to_db(prices)
            total_saved += count
            
            # Rate limiting
            time.sleep(SCRAPING_DELAY)
        
        return total_saved


if __name__ == "__main__":
    scraper = EnamScraper()
    total = scraper.run()
    print(f"\n✅ Total records processed: {total}")
