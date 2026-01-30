import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import urllib3
import os
from datetime import datetime
from dotenv import load_dotenv
import pathlib

# Load .env from server directory (parent/server/.env)
env_path = pathlib.Path(__file__).parent.parent / "server" / ".env"
load_dotenv(dotenv_path=env_path)

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ MONGO_URI not found! Using localhost fallback (MIGHT BE WRONG).")
    MONGO_URI = "mongodb://localhost:27017/techsprint"

client = MongoClient(MONGO_URI)
db = client.get_default_database()
collection = db["schemes"]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# ✅ SMART FILTER LOGIC
KEYWORDS = [
    "farmer", "agriculture", "kisan", "krishi", "crop",
    "irrigation", "subsidy", "loan", "insurance", "rural",
    "pm-kisan", "fasal bima", "kcc", "solar", "fertilizer",
    "dairy", "fisheries", "horticulture", "seed", "sheti", 
    "tractor", "machinery", "soil health", "animal husbandry"
]

BLACKLIST = [
    "student", "education", "women only", "startup", "urban", 
    "housing", "pension", "skill development", "scholarship", 
    "fellowship", "industrial", "corporate"
]

def is_farmer_scheme(text):
    text = text.lower()
    # 1. Check for Blacklist keywords
    if any(word in text for word in BLACKLIST):
        return False
        
    # 2. Check for Whitelist keywords
    return any(keyword in text for keyword in KEYWORDS)

def scrape_india_gov():
    print("🚀 Starting India.gov.in Scraper...")
    try:
        # Search page for 'agriculture' schemes directly to get relevant results
        url = "https://www.india.gov.in/my-government/schemes" 
        # Ideally we'd search query params like ?keywords=agriculture, but let's stick to scanning the main list or a known agri section if accessible.
        # Given the dynamic nature, let's try scraping the main list and filtering.
        
        response = requests.get(url, headers=HEADERS, verify=False, timeout=30)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        count = 0
        
        # Generic link Finder
        for a in soup.find_all('a', href=True):
            title = a.get_text().strip()
            link = a['href']
            
            # Smart Filter
            if len(title) > 10 and is_farmer_scheme(title):
                 if not link.startswith("http"):
                    link = "https://www.india.gov.in" + link
                 
                 save_scheme({
                    "title": title,
                    "description": "Scraped from India.gov.in. Verified for Agriculture relevance.",
                    "link": link,
                    "source": "India.gov.in"
                 })
                 count += 1

        print(f"🏁 Scraped {count} schemes from India.gov.in")
        
    except Exception as e:
        print(f"❌ Error scraping India.gov.in: {e}")

def scrape_agri_welfare():
    print("🚀 Starting AgriWelfare.gov.in Scraper...")
    try:
        url = "https://agriwelfare.gov.in/en/Major"
        response = requests.get(url, headers=HEADERS, verify=False, timeout=30)
        soup = BeautifulSoup(response.content, 'html.parser')

        count = 0
        for a in soup.find_all('a', href=True):
            title = a.get_text().strip()
            link = a['href']

            if len(title) > 5 and is_farmer_scheme(title):
                if not link.startswith("http"):
                     # Some links might be relative
                     if link.startswith("/"):
                        link = "https://agriwelfare.gov.in" + link
                
                save_scheme({
                    "title": title,
                    "description": "Ministry of Agriculture & Farmers Welfare Scheme.",
                    "link": link,
                    "source": "AgriWelfare.gov.in"
                })
                count += 1
        
        print(f"🏁 Scraped {count} schemes from Ministry of Agriculture")

    except Exception as e:
        print(f"❌ Error scraping AgriWelfare: {e}")

def save_scheme(data):
    if not collection.find_one({"title": data['title']}):
        scheme_doc = {
            "title": data['title'],
            "description": data.get("description", "Pending Verification"),
            "category": "Agriculture", # Default for this scraper
            "link": data['link'],
            "verified": False,
            "source": data['source'],
            "state": "All India",
            "eligibility": "Check official portal",
            "benefits": "Check official portal",
            "deadline": "Open",
            "createdAt": datetime.utcnow()
        }
        collection.insert_one(scheme_doc)
        print(f"✅ SAVE: {data['title']}")

if __name__ == "__main__":
    scrape_india_gov()
    scrape_agri_welfare()
    print(f"Total Pending Schemes in DB: {collection.count_documents({'verified': False})}")
