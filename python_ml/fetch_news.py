"""
Fetch climate-related agricultural news and populate the database
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from services.news_parser import NewsParser
from config import COMMODITIES

def fetch_news():
    """
    Run the news parser to fetch climate-related agricultural news
    """
    print("=" * 70)
    print("📰 FETCHING CLIMATE & AGRICULTURAL NEWS")
    print("=" * 70)
    
    parser = NewsParser()
    
    # Fetch news for all commodities
    total_saved = parser.run(commodities=COMMODITIES)
    
    print("\n" + "=" * 70)
    print(f"✅ NEWS FETCH COMPLETE!")
    print(f"   Total news items saved: {total_saved}")
    print("=" * 70)
    
    return total_saved

if __name__ == "__main__":
    try:
        fetch_news()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
