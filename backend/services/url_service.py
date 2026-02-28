import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any

from loguru import logger

async def scrape_url_content(url: str) -> Dict[str, Any]:
    """
    Scrapes the content of a given URL, extracting main text, title, and meta description.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract title
        title = soup.title.string if soup.title else "No title found"
        
        # Extract meta description
        meta_description = ""
        meta_tag = soup.find('meta', attrs={'name': 'description'})
        if meta_tag and 'content' in meta_tag.attrs:
            meta_description = meta_tag['content']
        
        # Extract main text content
        # Prioritize common article/main content tags
        main_content_tags = ['article', 'main', 'div', 'p']
        text_parts = []
        for tag_name in main_content_tags:
            for tag in soup.find_all(tag_name):
                # Avoid navigation, footer, header, script, style elements
                if tag.find_parent(['nav', 'footer', 'header', 'script', 'style', 'aside']):
                    continue
                text_parts.append(tag.get_text(separator=' ', strip=True))
        
        # Fallback to body text if specific content tags yield little
        if not text_parts or len(" ".join(text_parts)) < 100:
            body_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
            # Basic cleanup: remove excessive whitespace and common script/style content
            cleaned_body_text = ' '.join(body_text.split())
            text_content = cleaned_body_text
        else:
            text_content = ' '.join(text_parts)
            # Basic cleanup
            text_content = ' '.join(text_content.split())


        logger.info(f"Successfully scraped content from URL: {url}")
        return {
            "url": url,
            "title": title,
            "meta_description": meta_description,
            "main_text": text_content,
        }

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error scraping URL {url}: {e}")
        return {"error": f"HTTP error: {e.response.status_code}"}
    except httpx.RequestError as e:
        logger.error(f"Request error scraping URL {url}: {e}")
        return {"error": f"Request error: {e}"}
    except Exception as e:
        logger.error(f"An unexpected error occurred while scraping URL {url}: {e}")
        return {"error": f"Unexpected error: {e}"}
