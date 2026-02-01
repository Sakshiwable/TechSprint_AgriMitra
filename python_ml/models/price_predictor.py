"""
Price Prediction Model using Random Forest
Chosen because: handles non-linear patterns, robust to outliers, explainable
"""

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

class PricePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        )
        self.features = [
            'price_lag_1', 'price_lag_7', 'price_ma_7',
            'price_std_7', 'day_of_week', 'month'
        ]
    
    def prepare_features(self, df):
        """Create features for ML model"""
        df = df.sort_values('date')
        
        # Lag features
        df['price_lag_1'] = df.groupby('commodity')['modal_price'].shift(1)
        df['price_lag_7'] = df.groupby('commodity')['modal_price'].shift(7)
        
        # Rolling statistics
        df['price_ma_7'] = df.groupby('commodity')['modal_price'].rolling(7).mean().reset_index(0, drop=True)
        df['price_std_7'] = df.groupby('commodity')['modal_price'].rolling(7).std().reset_index(0, drop=True)
        
        # Time features
        df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
        df['month'] = pd.to_datetime(df['date']).dt.month
        
        # Price change percentage
        df['pricechange_pct'] = df.groupby('commodity')['modal_price'].pct_change()
        
        return df.dropna()
    
    def train(self, df):
        """Train the model"""
        print("📊 Preparing features...")
        df = self.prepare_features(df)
        
        X = df[self.features]
        y = df['modal_price']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print("🎯 Training model...")
        self.model.fit(X_train, y_train)
        
        # Evaluate
        predictions = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, predictions)
        r2 = r2_score(y_test, predictions)
        
        print(f"✅ Model Trained - MAE: ₹{mae:.2f}, R²: {r2:.3f}")
        
        # Save model
        os.makedirs('models/trained_models', exist_ok=True)
        joblib.dump(self.model, 'models/trained_models/price_model.pkl')
        joblib.dump(self.features, 'models/trained_models/features.pkl')
        
        return {'mae': mae, 'r2': r2}
    
    def predict_next_7_days(self, commodity_data):
        """Predict prices for next 7 days"""
        try:
            model = joblib.load('models/trained_models/price_model.pkl')
            
            #Prepare latest data
            df = self.prepare_features(commodity_data)
            
            if len(df) < 7:
                print(f"⚠️ Not enough data for prediction (need >7, have {len(df)})")
                return []
            
            predictions = []
            
            # Use the last available features as a baseline
            last_row = df.iloc[-1]
            last_price = last_row['modal_price']
            
            for i in range(7):
                # Simple prediction using last features
                X_pred = pd.DataFrame([{
                    'price_lag_1': last_price,
                    'price_lag_7': last_row['price_lag_7'],
                    'price_ma_7': last_row['price_ma_7'],
                    'price_std_7': last_row['price_std_7'],
                    'day_of_week': (datetime.now() + timedelta(days=i+1)).weekday(),
                    'month': datetime.now().month
                }])
                
                # Predict
                pred_price = model.predict(X_pred)[0]
                pred_date = datetime.now() + timedelta(days=i+1)
                
                predictions.append({
                    'date': pred_date.isoformat(),
                    'predicted_price': round(pred_price, 2),
                    'commodity': commodity_data['commodity'].iloc[0] if 'commodity' in commodity_data else 'Unknown',
                    'day': i+1
                })
                
                # Update for next iteration
                last_price = pred_price
            
            return predictions
        
        except FileNotFoundError:
            print("❌ Model not found. Please train first.")
            return []
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return []

if __name__ == "__main__":
    # Demo usage
    from pymongo import MongoClient
    from config import MONGO_URI
    
    client = MongoClient(MONGO_URI)
    db = client['techsprint']
    
    # Get data
    data = list(db.marketprices.find({'commodity': 'Tomato'}).sort('date', -1).limit(30))
    
    if len(data) >= 20:
        df = pd.DataFrame(data)
        predictor = PricePredictor()
        
        # Train
        results = predictor.train(df)
        
        # Predict
        predictions = predictor.predict_next_7_days(df)
        print("\n📈 7-Day Predictions:")
        for p in predictions:
            print(f"Day {p['day']}: ₹{p['predicted_price']}")
    else:
        print("❌ Not enough data. Run scraper first.")
