import requests
from bs4 import BeautifulSoup
import urllib3
from pymongo import MongoClient
import hashlib, time

# Suppress InsecureRequestWarning
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
}

client = MongoClient("mongodb://...")
db = client['agri']
col = db['sources']

def compute_hash(text): return hashlib.sha256(text.encode('utf-8')).hexdigest()

def scrape_and_store(url):
    r = requests.get(url, timeout=15)
    r.raise_for_status()
    html = r.text
    # minimal sanitize
    soup = BeautifulSoup(html, "html.parser")
    article = soup.find("article") or soup.body
    raw_html = str(article)
    source_hash = compute_hash(raw_html)
    doc = {
      "source_id": compute_hash(url),
      "url": url,
      "original_lang": "auto", 
      "raw_html": raw_html,
      "source_hash": source_hash,
      "metadata": {"scraped_at": time.time()}
    }
    col.update_one({"source_id": doc["source_id"]}, {"$set": doc}, upsert=True)

def scrape_pm_kisan():
    try:
        url = "https://pmkisan.gov.in/"
        # Just check connectivity for PM-KISAN
        response = requests.get(url, headers=HEADERS, timeout=15, verify=False)
        
        if response.status_code == 200:
             return [{
                "title": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
                "description": "Live Status: Portal is Online. Income support of Rs 6000/- per year.",
                "link": url,
                "category": "Financial Assistance",
                "deadline": "Open"
            }]
        return []
    except Exception as e:
        print(f"Error scraping PM-KISAN: {e}")
        # Return fallback if we know the URL is correct but just blocking bot
        return [{
                "title": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) [Offline mode]",
                "description": "Portal verification failed, but scheme is active.",
                "link": "https://pmkisan.gov.in/",
                "category": "Financial Assistance",
                "deadline": "Open"
        }]

def check_url_health(url, title, category, description):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10, verify=False)
        if response.status_code < 400:
            return {
                "title": title,
                "description": f"{description} (Status: Online ✅)",
                "link": url,
                "category": category,
                "deadline": "Open"
            }
    except:
        pass
    return None

def scrape_nabard():
    schemes = []
    
    # 1. Base Check: Is NABARD text accessible?
    base_nabard = check_url_health(
        "https://www.nabard.org/", 
        "National Bank for Agriculture and Rural Development (NABARD)", 
        "Development",
        "Official NABARD Portal for agricultural development schemes."
    )
    if base_nabard: schemes.append(base_nabard)

    try:
        # 2. Try to find specific updates
        url = "https://www.nabard.org/" 
        response = requests.get(url, headers=HEADERS, timeout=15, verify=False)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for a in soup.find_all('a', href=True):
            text = a.get_text().strip()
            link = a['href']
            
            if ("Fund" in text or "Scheme" in text) and len(text) > 10 and len(text) < 100:
                if not link.startswith("http"):
                    link = "https://www.nabard.org/" + link.lstrip('/')
                
                # Avoid duplicates with base
                if link != "https://www.nabard.org/":
                    schemes.append({
                        "title": text,
                        "description": "NABARD Initiative. Visit link for details.",
                        "link": link,
                        "category": "Development",
                        "deadline": "See Portal"
                    })
        
        # Return unique
        unique = {v['title']:v for v in schemes}.values()
        return list(unique)[:5]
    except Exception as e:
        print(f"Error scraping NABARD: {e}")
        return schemes # Return at least the base if found

def scrape_maharashtra_agri():
    schemes = []

    # 1. Base Check
    base_maha = check_url_health(
        "https://krishi.maharashtra.gov.in/", 
        "Maharashtra Agriculture Department Portal", 
        "State Scheme",
        "Official State Portal for localized schemes, market rates, and weather."
    )
    if base_maha: schemes.append(base_maha)

    try:
        url = "https://krishi.maharashtra.gov.in/"
        response = requests.get(url, headers=HEADERS, timeout=20, verify=False)
        response.encoding = 'utf-8' 
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for a in soup.find_all('a', href=True):
            text = a.get_text().strip()
            link = a['href']
            
            keywords = ["Yojana", "Scheme", "Pradhan Mantri", "Mission"]
            if any(k in text for k in keywords) and len(text) > 5:
                 if not link.startswith("http"):
                    link = "https://krishi.maharashtra.gov.in/" + link.lstrip('/')
                 
                 if link != "https://krishi.maharashtra.gov.in/":  
                    schemes.append({
                        "title": text,
                        "description": "Maharashtra Agriculture Dept Scheme.",
                        "link": link,
                        "category": "State Scheme",
                        "deadline": "Check Portal"
                    })
        
        unique = {v['title']:v for v in schemes}.values()
        return list(unique)[:8]
    except Exception as e:
        print(f"Error scraping Maha Agri: {e}")
        return schemes

def get_all_live_schemes():
    all_data = []
    
    # PM KISAN
    pm = scrape_pm_kisan() # This already returns a list
    if pm: all_data.extend(pm)
    
    # NABARD
    nb = scrape_nabard()
    if nb: all_data.extend(nb)
    
    # MAHA
    mh = scrape_maharashtra_agri()
    if mh: all_data.extend(mh)

    return all_data

if __name__ == "__main__":
    print(f"Found {len(get_all_live_schemes())} schemes")
    # print(get_all_live_schemes())
