"""
Weather Service for Price Correlation
Source: OpenWeatherMap API
"""

import requests
import time
from datetime import datetime
from pymongo import MongoClient
from config import (
    MONGO_URI, OPENWEATHER_API_KEY, OPENWEATHER_API_URL,
    WEATHER_CITIES, SCRAPING_DELAY, MAX_RETRIES, REQUEST_TIMEOUT
)


class WeatherService:
    """
    Weather data service using OpenWeatherMap API
    Tracks weather conditions in major agricultural regions
    """
    
    def __init__(self):
        self.api_key = OPENWEATHER_API_KEY
        self.api_url = OPENWEATHER_API_URL
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']  # Match Node.js database name
        self.weather_collection = self.db['weatherdata']
    
    def get_weather(self, city):
        """
        Fetch current weather for a city
        
        Args:
            city: City name
        
        Returns:
            Weather data dict or None
        """
        params = {
            'q': f"{city},IN",  # IN = India
            'appid': self.api_key,
            'units': 'metric'  # Celsius
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                response = requests.get(
                    self.api_url,
                    params=params,
                    timeout=REQUEST_TIMEOUT
                )
                
                response.raise_for_status()
                data = response.json()
                
                weather_data = {
                    'city': city,
                    'temperature': data['main']['temp'],
                    'feels_like': data['main']['feels_like'],
                    'humidity': data['main']['humidity'],
                    'pressure': data['main']['pressure'],
                    'weather_condition': data['weather'][0]['main'],
                    'weather_description': data['weather'][0]['description'],
                    'wind_speed': data['wind']['speed'],
                    'timestamp': datetime.now(),
                    'source': 'OpenWeatherMap'
                }
                
                # Add rain data if available
                if 'rain' in data:
                    weather_data['rainfall_1h'] = data['rain'].get('1h', 0)
                    weather_data['rainfall_3h'] = data['rain'].get('3h', 0)
                else:
                    weather_data['rainfall_1h'] = 0
                    weather_data['rainfall_3h'] = 0
                
                print(f"  ✅ Weather for {city}: {weather_data['temperature']}°C, {weather_data['weather_description']}")
                return weather_data
                
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ Weather API failed for {city} (attempt {attempt + 1}): {e}")
                
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2)
        
        print(f"  ❌ Failed to get weather for {city}")
        return None
    
    def get_weather_for_state(self, state):
        """
        Get weather for a state's capital/major city
        
        Args:
            state: State name
        
        Returns:
            Weather data dict or None
        """
        city = WEATHER_CITIES.get(state)
        
        if not city:
            print(f"  ⚠️ No weather city mapped for state: {state}")
            return None
        
        return self.get_weather(city)
    
    def analyze_weather_impact(self, weather_data):
        """
        Analyze weather impact on agriculture
        
        Args:
            weather_data: Weather data dict
        
        Returns:
            Impact assessment dict
        """
        if not weather_data:
            return None
        
        impact = {
            'overall_impact': 'neutral',
            'factors': []
        }
        
        temp = weather_data['temperature']
        rainfall = weather_data.get('rainfall_1h', 0)
        condition = weather_data['weather_condition'].lower()
        
        # Temperature analysis
        if temp > 35:
            impact['factors'].append('High temperature - may affect crop yield')
            impact['overall_impact'] = 'negative'
        elif temp < 10:
            impact['factors'].append('Low temperature - potential frost damage')
            impact['overall_impact'] = 'negative'
        
        # Rainfall analysis
        if rainfall > 10:
            impact['factors'].append('Heavy rainfall - transport delays possible')
            impact['overall_impact'] = 'negative'
        elif rainfall > 2:
            impact['factors'].append('Good rainfall - beneficial for crops')
            if impact['overall_impact'] == 'neutral':
                impact['overall_impact'] = 'positive'
        
        # Weather condition
        if 'storm' in condition or 'thunder' in condition:
            impact['factors'].append('Severe weather - crop damage risk')
            impact['overall_impact'] = 'negative'
        
        return impact
    
    def save_to_db(self, weather_data, state):
        """Save weather data to MongoDB"""
        if not weather_data:
            return False
        
        try:
            # Add state to record
            weather_data['state'] = state
            
            # Calculate impact
            impact = self.analyze_weather_impact(weather_data)
            weather_data['impact_analysis'] = impact
            
            self.weather_collection.insert_one(weather_data)
            print(f"  ✅ Saved weather data for {state}")
            return True
            
        except Exception as e:
            print(f"  ⚠️ Error saving weather data: {e}")
            return False
    
    def run(self, states=None):
        """
        Fetch weather for all tracked states
        
        Args:
            states: List of states (None = all)
        
        Returns:
            Number of weather records saved
        """
        print(f"🌤️ Running Weather Service...")
        
        target_states = states if states else list(WEATHER_CITIES.keys())
        saved_count = 0
        
        for state in target_states:
            weather_data = self.get_weather_for_state(state)
            
            if weather_data:
                if self.save_to_db(weather_data, state):
                    saved_count += 1
            
            # Rate limiting
            time.sleep(SCRAPING_DELAY)
        
        return saved_count


if __name__ == "__main__":
    service = WeatherService()
    total = service.run()
    print(f"\n✅ Total weather records saved: {total}")
