"""
Main Pipeline Orchestrator
Runs the complete ML pipeline: Scrape → Clean → Predict → Alert
"""

import sys
import pandas as pd
from pymongo import MongoClient
from config import MONGO_URI, COMMODITIES
from scrapers.demo_scraper import DemoMarketScraper
from models.price_predictor import PricePredictor
from alert_engine.alert_generator import AlertGenerator

def run_pipeline(commodity=None, train=False):
    """
    Main pipeline execution
    
    Args:
        commodity: Specific commodity to process (None = all)
        train: Whether to train model (default: False)
    """
    print("=" * 50)
    print("🌾 AgriMitra ML Pipeline Starting...")
    print("=" * 50)
    
    # Step 1: Scrape data
    print("\n📥 Step 1: Scraping market data...")
    scraper = DemoMarketScraper()
    scraped_data = scraper.run()
    
    # Step 2: Get historical data from MongoDB
    client = MongoClient(MONGO_URI)
    db = client['techsprint']  # Match Node.js database name
    
    commodities_to_process = [commodity] if commodity else COMMODITIES
    
    for comm in commodities_to_process:
        print(f"\n{'='*50}")
        print(f"📊 Processing: {comm}")
        print(f"{'='*50}")
        
        # Get data
        data = list(db.marketprices.find({'commodity': comm}).sort('date', -1).limit(60))
        
        if len(data) < 20:
            print(f"⚠️ Not enough data for {comm} ({len(data)} records). Skipping...")
            continue
        
        df = pd.DataFrame(data)
        
        # Step 3: Train or Load Model
        predictor = PricePredictor()
        
        if train or '--train' in sys.argv:
            print("\n🎯 Step 2: Training model...")
            results = predictor.train(df)
            print(f"✅ Training complete: MAE=₹{results['mae']:.2f}, R²={results['r2']:.3f}")
        
        # Step 4: Generate Predictions
        print("\n📈 Step 3: Generating 7-day predictions...")
        predictions = predictor.predict_next_7_days(df)
        
        if predictions:
            print(f"✅ Generated {len(predictions)} predictions:")
            for i, pred in enumerate(predictions[:3], 1):
                print(f"   Day {i}: ₹{pred['predicted_price']}")
        
        # Step 5: Generate Alerts
        print("\n🚨 Step 4: Generating alerts...")
        alert_gen = AlertGenerator()
        alerts = alert_gen.generate_alerts(predictions)
        
        if alerts:
            print(f"✅ Generated {len(alerts)} alerts:")
            for alert in alerts:
                print(f"   {alert['type']}: {alert['title']}")
        else:
            print("ℹ️ No actionable alerts")
    
    print("\n" + "=" * 50)
    print("✅ Pipeline Complete!")
    print("=" * 50)

if __name__ == "__main__":
    commodity = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else None
    train = '--train' in sys.argv
    
    run_pipeline(commodity=commodity, train=train)
