import puppeteer from 'puppeteer';
import Scheme from '../models/Scheme.js';
import FilterMetadata from '../models/FilterMetadata.js';

const BASE_URL = 'https://www.myscheme.gov.in';
const CATEGORY_URL = `${BASE_URL}/search/category/Agriculture,Rural%20&%20Environment`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * IMPROVED - Scrape schemes from myscheme.gov.in with better selectors
 */
export async function scrapeSchemeList() {
  let browser;
  const scrapedSchemes = [];
  
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    const page = await browser.newPage();
    
    // Better user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📄 Navigating to category page...');
    await page.goto(CATEGORY_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    // Wait for React/Angular to render
    console.log('⏳ Waiting for page to fully render...');
    await delay(5000);
    
    // Try to wait for common elements
   try {
      await page.waitForSelector('a, .card, [class*="scheme"], [class*="result"]', { timeout: 10000 });
    } catch (e) {
      console.log('⚠️  No standard selectors found, continuing anyway...');
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'page-loaded.png' });
    console.log('📸 Screenshot saved as page-loaded.png');
    
    // Log page info
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      bodyHTML: document.body.innerHTML.substring(0, 500)
    }));
    console.log('📄 Page Title:', pageInfo.title);
    console.log('📍 Current URL:', pageInfo.url);
    
    // Scroll to load lazy content
    console.log('📜 Scrolling to load all schemes...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(1000);
    }
    
    console.log('🔍 Extracting scheme data with improved selectors...');
    
    const schemes = await page.evaluate(() => {
      const schemeCards = [];
      
      // Try MULTIPLE selector strategies
      const selectorStrategies = [
        // Strategy 1: Look for links that might contain schemes
        'a[href*="/scheme/"]',
        'a[href*="/schemes/"]',
        
        // Strategy 2: Common card patterns
        '.scheme-card',
        '.result-card',
        '[class*="SchemeCard"]',
        '[class*="scheme-item"]',
        
        // Strategy 3: Material/Bootstrap patterns
        '.mat-card',
        '.card',
        'mat-card',
        
        // Strategy 4: List items
        'li[class*="scheme"]',
        'li[class*="result"]',
        
        // Strategy 5: Div containers
        'div[class*="scheme-"]',
        'div[class*="SchemeItem"]'
      ];
      
      let foundElements = [];
      
      for (const selector of selectorStrategies) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          foundElements = Array.from(elements);
          break;
        }
      }
      
      if (foundElements.length === 0) {
        // Last resort: find all links and filter
        const allLinks = Array.from(document.querySelectorAll('a'));
        foundElements = allLinks.filter(link => {
          const href = link.getAttribute('href') || '';
          return href.includes('scheme') || href.includes('Scheme');
        });
        console.log(`Fallback: Found ${foundElements.length} scheme-related links`);
      }
      
      // Process found elements
      foundElements.forEach((element, index) => {
        try {
          let name = '';
          let schemeUrl = '';
          let shortDescription = '';
          let stateText = '';
          let tags = [];
          
          // If element is a link
          if (element.tagName === 'A') {
            schemeUrl = element.href;
            name = element.textContent.trim();
            
            // Try to find more details in parent or children
            const parent = element.closest('.card, .mat-card, [class*="card"], li, div[class*="item"]');
            if (parent) {
              const allText = parent.textContent;
              const paragraphs = parent.querySelectorAll('p');
              if (paragraphs.length > 0) {
                shortDescription = paragraphs[0].textContent.trim();
              }
              
              // Look for state/type indicators
              const badges = parent.querySelectorAll('.badge, .chip, .tag, [class*="badge"], [class*="tag"]');
              badges.forEach(badge => {
                const text = badge.textContent.trim();
                if (text) tags.push(text);
              });
            }
          } else {
            // Element is a card/container
            const link = element.querySelector('a');
            if (link) {
              schemeUrl = link.href;
            }
            
            // Try to find heading
            const heading = element.querySelector('h1, h2, h3, h4, h5, [class*="title"], [class*="heading"], [class*="name"]');
            if (heading) {
              name = heading.textContent.trim();
            } else {
              const firstLink = element.querySelector('a');
              if (firstLink) name = firstLink.textContent.trim();
            }
            
            // Get description
            const desc = element.querySelector('p, [class*="description"], [class*="desc"]');
            if (desc) {
              shortDescription = desc.textContent.trim();
            }
            
            // Get tags/badges
            element.querySelectorAll('.badge, .chip, .tag, [class*="badge"], [class*="tag"], span[class*="label"]').forEach(badge => {
              const text = badge.textContent.trim();
              if (text && text.length < 50) tags.push(text);
            });
          }
          
          // Clean up name
          name = name.split('\n')[0].trim();
          
          // Make URL absolute
          if (schemeUrl && !schemeUrl.startsWith('http')) {
            schemeUrl = `${window.location.origin}${schemeUrl}`;
          }
          
          if (name && schemeUrl) {
            schemeCards.push({
              name,
              stateText,
              shortDescription: shortDescription.substring(0, 500),
              tags: [...new Set(tags)], // Remove duplicates
              schemeUrl
            });
          }
        } catch (err) {
          console.error(`Error processing element ${index}:`, err.message);
        }
      });
      
      return schemeCards;
    });
    
    console.log(`✅ Found ${schemes.length} schemes`);
    
    if (schemes.length === 0) {
      // Debug: Save page HTML
      const html = await page.content();
      const fs = await import('fs');
      fs.writeFileSync('page-debug.html', html);
      console.log('📝 Saved full HTML to page-debug.html for debugging');
    }
    
    // Save schemes to database
    for (const scheme of schemes) {
      try {
        const type = scheme.stateText?.toLowerCase().includes('central') || 
                     scheme.stateText?.toLowerCase().includes('all india') ||
                     !scheme.stateText ? 'Central' : 'State';
        
        const state = type === 'State' ? scheme.stateText : 'All India';
        
        const schemeData = {
          name: scheme.name,
          state,
          type,
          category: ['Agriculture', 'Rural & Environment'],
          tags: scheme.tags,
          shortDescription: scheme.shortDescription || 'No description available',
          schemeUrl: scheme.schemeUrl,
          scrapingStatus: 'pending'
        };
        
        await Scheme.findOneAndUpdate(
          { schemeUrl: scheme.schemeUrl },
          schemeData,
          { upsert: true, new: true }
        );
        
        scrapedSchemes.push(schemeData);
        console.log(`✅ Saved: ${scheme.name}`);
        
      } catch (err) {
        console.error(`❌ Error saving scheme ${scheme.name}:`, err.message);
      }
    }
    
    await browser.close();
    
    console.log(`\n✨ Successfully scraped ${scrapedSchemes.length} schemes`);
    return scrapedSchemes;
    
  } catch (error) {
    console.error('❌ Error scraping scheme list:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// Export the main function
export async function scrapeAllData() {
  try {
    console.log('🎯 Starting improved scraping process...');
    console.log('📍 Target: ' + CATEGORY_URL);
    
    const schemes = await scrapeSchemeList();
    
    console.log('\n✨ Scraping completed!');
    console.log(`📊 Total schemes found: ${schemes.length}`);
    
    return {
      totalSchemes: schemes.length,
      success: schemes.length > 0
    };
    
  } catch (error) {
    console.error('❌ Error in main scraping process:', error);
    throw error;
  }
}
