"""
Google News RSS Parser for Demand Signal Analysis
Source: Google News RSS Feed
"""

import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from pymongo import MongoClient
from config import (
    MONGO_URI, GOOGLE_NEWS_RSS_BASE,
    COMMODITIES, DEMAND_KEYWORDS, SCRAPING_DELAY, MAX_RETRIES, REQUEST_TIMEOUT
)
import time


class NewsParser:
    """
    Parses Google News RSS feeds for agricultural commodity news
    Identifies demand signals and price trends
    """
    
    def __init__(self):
        self.rss_base_url = GOOGLE_NEWS_RSS_BASE
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['techsprint']  # Match Node.js database name
        self.news_collection = self.db['newsalerts']
    
    def parse_commodity_news(self, commodity):
        """
        Parse news RSS feed for a specific commodity
        
        Args:
            commodity: Commodity name
        
        Returns:
            List of news items
        """
        query = f"{commodity}"
        rss_url = self.rss_base_url.format(query=query)
        
        print(f"  📰 Fetching news for {commodity}...")
        
        news_items = []
        
        for attempt in range(MAX_RETRIES):
            try:
                response = requests.get(
                    rss_url,
                    headers={'User-Agent': 'Mozilla/5.0'},
                    timeout=REQUEST_TIMEOUT
                )
                
                response.raise_for_status()
                
                # Parse XML
                root = ET.fromstring(response.content)
                
                # Find all <item> elements in RSS feed
                items = root.findall('.//item')
                
                for item in items[:10]:  # Limit to 10 most recent news items
                    try:
                        title = item.find('title').text if item.find('title') is not None else ''
                        link = item.find('link').text if item.find('link') is not None else ''
                        pub_date_str = item.find('pubDate').text if item.find('pubDate') is not None else ''
                        source = item.find('source').text if item.find('source') is not None else 'Unknown'
                        
                        # Parse publish date
                        try:
                            # RSS date format: 'Wed, 31 Jan 2026 10:00:00 GMT'
                            pub_date = datetime.strptime(pub_date_str, '%a, %d %b %Y %H:%M:%S %Z')
                        except:
                            pub_date = datetime.now()
                        
                        # Analyze sentiment and extract keywords
                        sentiment, keywords = self.analyze_sentiment(title)
                        
                        news_item = {
                            'commodity': commodity,
                            'headline': title,
                            'url': link,
                            'published_at': pub_date,
                            'source': source,
                            'sentiment': sentiment,
                            'demand_signals': keywords,
                            'fetched_at': datetime.now()
                        }
                        
                        news_items.append(news_item)
                    
                    except Exception as e:
                        print(f"    ⚠️ Error parsing news item: {e}")
                        continue
                
                if news_items:
                    print(f"  ✅ Found {len(news_items)} news items for {commodity}")
                    return news_items
                else:
                    print(f"  ⚠️ No news items found for {commodity}")
                    return []
                
            except requests.exceptions.RequestException as e:
                print(f"  ⚠️ News fetch failed (attempt {attempt + 1}): {e}")
                
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2)
        
        print(f"  ❌ Failed to fetch news for {commodity}")
        return []
    
    def analyze_sentiment(self, text):
        """
        Analyze text for demand signals using keyword matching
        
        Args:
            text: News headline or text
        
        Returns:
            Tuple of (sentiment, matched_keywords)
        """
        text_lower = text.lower()
        matched_keywords = []
        
        # Check for demand signal keywords
        for keyword in DEMAND_KEYWORDS:
            if keyword.lower() in text_lower:
                matched_keywords.append(keyword)
        
        # Determine sentiment
        positive_keywords = ['high demand', 'export', 'good harvest', 'bumper crop']
        negative_keywords = ['shortage', 'crop damage', 'supply disruption', 'price rise', 'inflation']
        
        positive_count = sum(1 for kw in positive_keywords if kw in text_lower)
        negative_count = sum(1 for kw in negative_keywords if kw in text_lower)
        
        if negative_count > positive_count:
            sentiment = 'bearish'  # Prices likely to rise due to negative supply factors
        elif positive_count > negative_count:
            sentiment = 'bullish'  # Prices may be stable or fall due to good supply
        else:
            sentiment = 'neutral'
        
        return sentiment, matched_keywords
    
    def save_to_db(self, news_items):
        """Save news items to MongoDB"""
        if not news_items:
            return 0
        
        saved_count = 0
        
        for news_item in news_items:
            try:
                # Avoid duplicates based on URL
                existing = self.news_collection.find_one({'url': news_item['url']})
                
                if not existing:
                    self.news_collection.insert_one(news_item)
                    saved_count += 1
                
            except Exception as e:
                print(f"  ⚠️ Error saving news item: {e}")
        
        if saved_count > 0:
            print(f"  ✅ Saved {saved_count} new news items to database")
        
        return saved_count
    
    def get_demand_signals_summary(self, commodity):
        """
        Get summary of demand signals for a commodity from recent news
        
        Args:
            commodity: Commodity name
        
        Returns:
            Summary dict
        """
        # Get recent news (last 7 days)
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=7)
        
        recent_news = list(self.news_collection.find({
            'commodity': commodity,
            'published_at': {'$gte': cutoff_date}
        }).sort('published_at', -1))
        
        if not recent_news:
            return None
        
        # Aggregate signals
        all_signals = []
        sentiment_counts = {'bearish': 0, 'bullish': 0, 'neutral': 0}
        
        for news in recent_news:
            all_signals.extend(news.get('demand_signals', []))
            sentiment_counts[news.get('sentiment', 'neutral')] += 1
        
        # Determine overall sentiment
        if sentiment_counts['bearish'] > sentiment_counts['bullish']:
            overall = 'bearish'
        elif sentiment_counts['bullish'] > sentiment_counts['bearish']:
            overall = 'bullish'
        else:
            overall = 'neutral'
        
        summary = {
            'commodity': commodity,
            'overall_sentiment': overall,
            'news_count': len(recent_news),
            'top_signals': list(set(all_signals))[:5],  # Top 5 unique signals
            'sentiment_breakdown': sentiment_counts
        }
        
        return summary
    
    def run(self, commodities=None):
        """
        Fetch and parse news for all commodities
        
        Args:
            commodities: List of commodities (None = all)
        
        Returns:
            Total number of news items saved
        """
        print(f"📰 Running News Parser...")
        
        target_commodities = commodities if commodities else COMMODITIES
        total_saved = 0
        
        for commodity in target_commodities:
            news_items = self.parse_commodity_news(commodity)
            count = self.save_to_db(news_items)
            total_saved += count
            
            # Rate limiting
            time.sleep(SCRAPING_DELAY)
        
        return total_saved


if __name__ == "__main__":
    parser = NewsParser()
    total = parser.run()
    print(f"\n✅ Total news items saved: {total}")
