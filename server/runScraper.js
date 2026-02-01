import puppeteer from 'puppeteer';
import Scheme from './models/Scheme.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://www.myscheme.gov.in';
const CATEGORY_URL = `${BASE_URL}/search/category/Agriculture,Rural%20&%20Environment`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeAllSchemes() {
  let browser;
  const allSchemes = [];
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📄 Navigating to myScheme.gov.in...');
    await page.goto(CATEGORY_URL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    console.log('⏳ Waiting for initial page load...');
    await delay(5000);
    
    // Strategy 1: Infinite scroll + Load More clicking
    console.log('📜 Loading all schemes via scrolling and clicking Load More...\n');
    
    let previousSchemeCount = 0;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000);
      
      // Try to click "Load More" or "Show More" button
      const loadMoreClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const loadMoreBtn = buttons.find(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('load more') || 
                 text.includes('show more') ||
                 text.includes('view more') ||
                 text.includes('see more');
        });
        
        if (loadMoreBtn && loadMoreBtn.offsetParent !== null) { // Check if visible
          loadMoreBtn.click();
          return true;
        }
        return false;
      });
      
      if (loadMoreClicked) {
        console.log('  ✓ Clicked "Load More" button');
        await delay(3000); // Wait for new content to load
      }
      
      // Count current schemes on page
      const currentSchemeCount = await page.evaluate(() => {
        // Count elements that look like scheme cards
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let schemeCount = 0;
        headings.forEach(h => {
          const text = h.textContent;
          if (text && (text.includes('Scheme') || text.includes('Yojana') || text.includes('Programme'))) {
            schemeCount++;
          }
        });
        return schemeCount;
      });
      
      console.log(`  📊 Currently loaded: ${currentSchemeCount} schemes`);
      
      // If no new schemes loaded, we're done
      if (currentSchemeCount === previousSchemeCount) {
        console.log('  ✓ No more schemes to load\n');
        break;
      }
      
      previousSchemeCount = currentSchemeCount;
      attempts++;
    }
    
    console.log(`🔍 Extracting all ${previousSchemeCount} schemes from page...\n`);
    
    // Extract all schemes
    const schemes = await page.evaluate(() => {
      const schemeData = [];
      const seenNames = new Set();
      
      // Find all headings that might be scheme names
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      headings.forEach(heading => {
        const name = heading.textContent.trim();
        
        // Filter for scheme-like names
        if (name && name.length > 5 && !seenNames.has(name)) {
          const hasSchemeKeywords = name.includes('Scheme') || 
                                   name.includes('Yojana') ||
                                   name.includes('scheme') ||
                                   name.includes('Programme') ||
                                   name.includes('Mantri') ||
                                   name.includes('Krishi');
          
          if (hasSchemeKeywords) {
            seenNames.add(name);
            
            // Find parent container
            let container = heading.closest('div, article, section, li');
            let description = '';
            let link = '';
            let state = 'All India';
            
            if (container) {
              // Get description
              const paragraphs = container.querySelectorAll('p');
              if (paragraphs.length > 0) {
                description = Array.from(paragraphs)
                  .map(p => p.textContent.trim())
                  .filter(t => t.length > 20)
                  .join(' ')
                  .substring(0, 800);
              }
              
              // Get link
              const anchor = container.querySelector('a[href*="/scheme"]') || 
                           container.querySelector('a');
              if (anchor) {
                link = anchor.href;
              }
              
              // Detect state from text
              const fullText = container.textContent;
              const statePatterns = [
                'Himachal Pradesh', 'Arunachal Pradesh', 'Madhya Pradesh', 'Uttar Pradesh', 'Andhra Pradesh',
                'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Jharkhand',
                'Karnataka', 'Kerala', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
                'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
                'Telangana', 'Tripura', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
              ];
              
              for (const stateName of statePatterns) {
                if (fullText.includes(stateName)) {
                  state = stateName;
                  break;
                }
              }
            }
            
            if (link) {
              schemeData.push({
                name,
                state,
                description: description || 'No description available',
                schemeUrl: link
              });
            }
          }
        }
      });
      
      return schemeData;
    });
    
    console.log(`✅ Extracted ${schemes.length} unique schemes\n`);
    
    if (schemes.length === 0) {
      console.log('⚠️  No schemes found with current method');
      console.log('📝 Saving page HTML for debugging...');
      const html = await page.content();
      const fs = await import('fs');
      fs.writeFileSync('full-page-content.html', html);
      console.log('✅ Saved to full-page-content.html');
    }
    
    await browser.close();
    
    // Clear existing schemes and save new ones
    console.log('🗑️  Clearing old schemes from database...');
    await Scheme.deleteMany({});
    console.log('✅ Cleared\n');
    
    console.log('💾 Saving schemes to database...\n');
    let savedCount = 0;
    let errorCount = 0;
    
    for (const scheme of schemes) {
      try {
        const type = scheme.state === 'All India' ? 'Central' : 'State';
        
        const schemeData = {
          name: scheme.name,
          state: scheme.state,
          type,
          category: ['Agriculture', 'Rural & Environment'],
          shortDescription: scheme.description,
          schemeUrl: scheme.schemeUrl,
          tags: [type, 'Agriculture'],
          scrapingStatus: 'success',
          lastScraped: new Date()
        };
        
        await Scheme.create(schemeData);
        savedCount++;
        
        if (savedCount % 10 === 0) {
          console.log(`  ✓ Saved ${savedCount} schemes...`);
        }
        
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate - skip silently
        } else {
          errorCount++;
          if (errorCount <= 5) { // Only show first 5 errors
            console.error(`  ✗ Error saving ${scheme.name.substring(0, 40)}:`, err.message);
          }
        }
      }
    }
    
    await mongoose.connection.close();
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 SCRAPING COMPLETED!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Total schemes found: ${schemes.length}`);
    console.log(`✅ Successfully saved: ${savedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`💡 Refresh your browser at: http://localhost:5173/gov-schemes`);
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    if (browser) await browser.close();
    if (mongoose.connection.readyState === 1) await mongoose.connection.close();
    process.exit(1);
  }
}

console.log('🌾 MyScheme.gov.in Agriculture Schemes Scraper');
console.log('='.repeat(60));
scrapeAllSchemes();
