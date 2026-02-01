# Demo market price scraper for AgriMitra
# For production, use official eNAM/Agmarknet APIs or datasets

import requests
from datetime import datetime
import random
from pymongo import MongoClient
from config import MONGO_URI, COMMODITIES, STATES

class DemoMarketScraper:
    """
    Demo scraper that generates realistic market price data
    In production: Replace with actual eNAM API calls
    """
    
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']  # Match Node.js database name
        self.collection = self.db['marketprices']
    
    def generate_demo_prices(self):
        """
        Generates realistic demo price data
        Base prices (INR per quintal):
        - Tomato: 800-1500
        - Onion: 1000-2000
        - Potato: 700-1200
        - Wheat: 2000-2500
        - Rice: 2500-3500
        - Cotton: 5000-7000
        """
        
        base_prices = {
            "Tomato": (800, 1500),
            "Onion": (1000, 2000),
            "Potato": (700, 1200),
            "Wheat": (2000, 2500),
            "Rice": (2500, 3500),
            "Cotton": (5000, 7000)
        }
        
        prices = []
        current_date = datetime.now()
        
        for commodity in COMMODITIES:
            for state in STATES[:3]:  # Limit to 3 states for demo
                if commodity in base_prices:
                    min_price, max_price = base_prices[commodity]
                    modal_price = random.randint(min_price, max_price)
                    
                    price_data = {
                        'commodity': commodity,
                        'state': state,
                        'market': f"{state} APMC",
                        'modal_price': modal_price,
                        'min_price': modal_price - random.randint(50, 200),
                        'max_price': modal_price + random.randint(50, 200),
                        'arrival_quantity': random.randint(100, 5000),
                        'date': current_date,
                        'source': 'Demo',
                        'scraped_at': datetime.now()
                    }
                    
                    prices.append(price_data)
        
        return prices
    
    def save_to_db(self, prices):
        """Saves price data to MongoDB"""
        if prices:
            result = self.collection.insert_many(prices)
            print(f"✅ Inserted {len(result.inserted_ids)} price records")
            return len(result.inserted_ids)
        return 0
    
    def run(self):
        """Main execution"""
        print("🌾 Running Demo Market Price Scraper...")
        prices = self.generate_demo_prices()
        count = self.save_to_db(prices)
        print(f"📊 Total prices scraped: {count}")
        return prices

if __name__ == "__main__":
    scraper = DemoMarketScraper()
    scraper.run()
