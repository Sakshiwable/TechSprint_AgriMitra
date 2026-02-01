// Debug script to inspect the myscheme.gov.in page structure
import puppeteer from 'puppeteer';

const CATEGORY_URL = 'https://www.myscheme.gov.in/search/category/Agriculture,Rural%20&%20Environment';

async function inspectPage() {
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('📄 Navigating to page...');
  await page.goto(CATEGORY_URL, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('🔍 Inspecting page structure...');
  
  const pageInfo = await page.evaluate(() => {
    // Get page title
    const title = document.title;
    
    // Count different element types
    const divs = document.querySelectorAll('div').length;
    const articles = document.querySelectorAll('article').length;
    const sections = document.querySelectorAll('section').length;
    
    // Look for scheme-related elements
    const possibleSchemeContainers = [];
    const containers = document.querySelectorAll('div, article, section, li');
    
    containers.forEach((el, index) => {
      const className = el.className;
      const id = el.id;
      const text = el.textContent?.substring(0, 100);
      
      if ((className && (
        className.includes('scheme') ||
        className.includes('card') ||
        className.includes('result') ||
        className.includes('item')
      )) || (id && id.includes('scheme'))) {
        possibleSchemeContainers.push({
          tag: el.tagName,
          className,
          id,
          textPreview: text,
          hasLink: !!el.querySelector('a'),
          linkHref: el.querySelector('a')?.href
        });
      }
    });
    
    // Get first 5 matches
    return {
      title,
      counts: { divs, articles, sections },
      possibleContainers: possibleSchemeContainers.slice(0, 10)
    };
  });
  
  console.log('\n📊 Page Analysis:');
  console.log('================');
  console.log('Title:', pageInfo.title);
  console.log('\nElement counts:', pageInfo.counts);
  console.log('\nPossible scheme containers:');
  console.log(JSON.stringify(pageInfo.possibleContainers, null, 2));
  
  // Take a screenshot
  await page.screenshot({ path: 'myscheme-debug.png', fullPage: true });
  console.log('\n📸 Screenshot saved as myscheme-debug.png');
  
  console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await browser.close();
  console.log('\n✅ Inspection complete!');
}

inspectPage().catch(console.error);
