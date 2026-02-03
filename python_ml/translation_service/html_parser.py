from bs4 import BeautifulSoup, NavigableString
from typing import List, Tuple
import bleach

ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th']
ALLOWED_ATTRS = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height'],
    '*': ['class', 'id']
}

class HTMLParser:
    """Parse HTML and extract translatable text while preserving structure"""
    
    def __init__(self):
        self.text_nodes = []
        self.soup = None
    
    def sanitize_html(self, html_content: str) -> str:
        """Sanitize HTML to prevent XSS attacks"""
        return bleach.clean(
            html_content, 
            tags=ALLOWED_TAGS, 
            attributes=ALLOWED_ATTRS, 
            strip=True
        )
    
    def extract_text_nodes(self, html_content: str) -> Tuple[BeautifulSoup, List[str]]:
        """
        Extract all translatable text nodes from HTML
        
        Returns:
            Tuple of (BeautifulSoup object, list of text strings)
        """
        # Sanitize first
        clean_html = self.sanitize_html(html_content)
        
        # Parse HTML
        self.soup = BeautifulSoup(clean_html, 'html.parser')
        texts = []
        
        # Extract text from all text nodes
        for element in self.soup.find_all(string=True):
            if isinstance(element, NavigableString):
                text = str(element).strip()
                # Skip empty strings and scripts/styles
                if text and element.parent.name not in ['script', 'style', 'meta']:
                    texts.append(text)
        
        self.text_nodes = texts
        return self.soup, texts
    
    def reconstruct_html(self, soup: BeautifulSoup, translated_texts: List[str]) -> str:
        """
        Reconstruct HTML with translated text nodes
        
        Args:
            soup: BeautifulSoup object
            translated_texts: List of translated strings
        
        Returns:
            HTML string with translated text
        """
        i = 0
        
        # Replace each text node with translation
        for element in soup.find_all(string=True):
            if isinstance(element, NavigableString):
                text = str(element).strip()
                if text and element.parent.name not in ['script', 'style', 'meta']:
                    if i < len(translated_texts):
                        # Preserve leading/trailing whitespace
                        original = str(element)
                        if original.startswith(' '):
                            translated_texts[i] = ' ' + translated_texts[i]
                        if original.endswith(' '):
                            translated_texts[i] = translated_texts[i] + ' '
                        
                        element.replace_with(translated_texts[i])
                        i += 1
        
        return str(soup)
    
    def chunk_text(self, text: str, max_chunk_size: int = 500) -> List[str]:
        """
        Split long text into chunks for translation
        
        Args:
            text: Text to chunk
            max_chunk_size: Maximum characters per chunk
        
        Returns:
            List of text chunks
        """
        if len(text) <= max_chunk_size:
            return [text]
        
        chunks = []
        sentences = text.split('. ')
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= max_chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
