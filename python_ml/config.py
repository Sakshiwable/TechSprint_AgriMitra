import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI')

# Backend API
NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:4000')

# Data Sources
ENAM_BASE_URL = "https://enam.gov.in/web/"
ENAM_DASHBOARD_URL = "https://enam.gov.in/web/dashboard/trade-data"
AGMARKNET_URL = "https://agmarknet.gov.in/"

# API Keys
DATA_GOV_API_KEY = os.getenv('DATA_GOV_API_KEY', '579b464db66ec23bdd0000010982b843863148d15c2c1e495218ee9d')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '0ac90059486946708daa2ecdece0f20f')

# Data.gov.in API
DATA_GOV_API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Weather API
OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

# News RSS
GOOGLE_NEWS_RSS_BASE = "https://news.google.com/rss/search?q={query}+price+india"

# Alert Thresholds
PRICE_DROP_THRESHOLD = 0.10  # 10% drop
PRICE_SPIKE_THRESHOLD = 0.15  # 15% increase

# Commodities to track
COMMODITIES = ["Tomato", "Onion", "Potato", "Wheat", "Rice", "Cotton"]

# States to track
STATES = ["Maharashtra", "Gujarat", "Karnataka", "Uttar Pradesh", "Punjab"]

# Major cities for weather tracking (state capitals)
WEATHER_CITIES = {
    "Maharashtra": "Mumbai",
    "Gujarat": "Ahmedabad",
    "Karnataka": "Bangalore",
    "Uttar Pradesh": "Lucknow",
    "Punjab": "Chandigarh"
}

# Demand signal keywords for news analysis
DEMAND_KEYWORDS = [
    "shortage",
    "price rise",
    "export",
    "high demand",
    "inflation",
    "supply disruption",
    "crop damage"
]

# Scraping Configuration
SCRAPING_DELAY = 2  # seconds between requests
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30  # seconds
