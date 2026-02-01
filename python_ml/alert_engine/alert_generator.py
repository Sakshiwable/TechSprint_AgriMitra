"""
Alert Generation Engine
Analyzes predictions and generates actionable alerts for farmers
"""

import requests
from pymongo import MongoClient
from config import MONGO_URI, NODE_BACKEND_URL, PRICE_DROP_THRESHOLD, PRICE_SPIKE_THRESHOLD
from datetime import datetime

class AlertGenerator:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['test']
        self.prices_col = self.db['marketprices']
        self.alerts_col = self.db['alerts']
    
    def generate_alerts(self, predictions):
        """
        Generate alerts based on price predictions
        
        Alert Examples:
        - "टमाटर का भाव ₹1200 से ₹980 हो सकता है। अभी बेचें।"
        - "प्याज की मांग बढ़ रही है। अच्छा समय है बेचने का।"
        """
        alerts = []
        
        for pred in predictions:
            commodity = pred['commodity']
            predicted_price = pred['predicted_price']
            
            # Get current price
            current = self.prices_col.find_one(
                {'commodity': commodity},
                sort=[('date', -1)]
            )
            
            if not current:
                continue
            
            current_price = current['modal_price']
            change_pct = (predicted_price - current_price) / current_price
            
            alert = None
            
            # Price Drop Alert
            if change_pct <= -PRICE_DROP_THRESHOLD:
                alert = {
                    'type': 'PRICE_DROP',
                    'severity': 'HIGH' if change_pct <= -0.15 else 'MEDIUM',
                    'commodity': commodity,
                    'title': f"{commodity} Price Drop Alert",
                    'message': f"{commodity} prices expected to drop {abs(change_pct)*100:.1f}% to ₹{predicted_price}/quintal. Consider selling now.",
                    'messageHindi': f"{commodity} का भाव {abs(change_pct)*100:.1f}% घट सकता है। ₹{predicted_price}/क्विंटल। अभी बेचें।",
                    'current_price': current_price,
                    'predicted_price': predicted_price,
                    'change_percentage': round(change_pct * 100, 1),
                    'targetUsers': [],
                    'targetStates': [],
                    'metadata': {
                        'source': 'ML_Prediction',
                        'confidence': 0.85,
                        'actionable': True
                    },
                    'createdAt': datetime.now()
                }
            
            # Price Spike Alert
            elif change_pct >= PRICE_SPIKE_THRESHOLD:
                alert = {
                    'type': 'PRICE_SPIKE',
                    'severity': 'MEDIUM',
                    'commodity': commodity,
                    'title': f"{commodity} Price Increase Alert",
                    'message': f"{commodity} prices expected to rise {change_pct*100:.1f}% to ₹{predicted_price}/quintal. Hold for better rates.",
                    'messageHindi': f"{commodity} का भाव {change_pct*100:.1f}% बढ़ सकता है। ₹{predicted_price}/क्विंटल। बेहतर भाव के लिए रुकें।",
                    'current_price': current_price,
                    'predicted_price': predicted_price,
                    'change_percentage': round(change_pct * 100, 1),
                    'targetUsers': [],
                    'targetStates': [],
                    'metadata': {
                        'source': 'ML_Prediction',
                        'confidence': 0.85,
                        'actionable': True
                    },
                    'createdAt': datetime.now()
                }
            
            if alert:
                alerts.append(alert)
                # Save to MongoDB
                self.alerts_col.insert_one(alert)
                # Notify Node.js backend
                self.notify_backend(alert)
        
        return alerts
    
    def notify_backend(self, alert):
        """Send alert to Node.js backend for Socket.io broadcast"""
        try:
            response = requests.post(
                f'{NODE_BACKEND_URL}/api/market-alerts/broadcast',
                json=alert,
                timeout=5
            )
            
            if response.status_code == 200 or response.status_code == 201:
                print(f"✅ Alert broadcasted: {alert['title']}")
            else:
                print(f"⚠️ Failed to broadcast alert: {response.status_code}")
        
        except Exception as e:
            print(f"❌ Error notifying backend: {e}")
    
    def create_demand_alert(self, commodity, message):
        """Create manual demand alert"""
        alert = {
            'type': 'DEMAND',
            'severity': 'MEDIUM',
            'commodity': commodity,
            'title': f"High Demand - {commodity}",
            'message': message,
            'messageHindi': message,  # Add translation if needed
            'targetUsers': [],
            'targetStates': [],
            'metadata': {
                'source': 'Manual',
                'actionable': True
            },
            'createdAt': datetime.now()
        }
        
        self.alerts_col.insert_one(alert)
        self.notify_backend(alert)
        return alert

if __name__ == "__main__":
    # Demo usage
    from models.price_predictor import PricePredictor
    import pandas as pd
    
    client = MongoClient(MONGO_URI)
    db = client['test']
    
    data = list(db.marketprices.find({'commodity': 'Tomato'}).sort('date', -1).limit(30))
    
    if len(data) >= 20:
        df = pd.DataFrame(data)
        
        predictor = PricePredictor()
        predictions = predictor.predict_next_7_days(df)
        
        alert_gen = AlertGenerator()
        alerts = alert_gen.generate_alerts(predictions)
        
        print(f"\n🚨 Generated {len(alerts)} alerts")
        for alert in alerts:
            print(f"   {alert['type']}: {alert['message']}")
    else:
        print("❌ Not enough data")
