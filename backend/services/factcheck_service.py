import os
from typing import List, Dict, Any, Optional
from loguru import logger
from googleapiclient.discovery import build # Requires 'google-api-python-client'
from googleapiclient.errors import HttpError

from backend.config import settings

async def search_for_fact_checks(query: str, language_code: str = "en-US", max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Searches for fact-checks related to a given query using the Google Fact Check Tools API.
    """
    if not settings.GOOGLE_FACT_CHECK_API_KEY:
        logger.warning("Google Fact Check API key not configured. Skipping fact-check search.")
        return []

    try:
        service = build("factchecktools", "v1alpha1", developerKey=settings.GOOGLE_FACT_CHECK_API_KEY)
        
        request = service.claims().search(
            query=query,
            languageCode=language_code,
            pageSize=max_results
        )
        response = request.execute()
        
        fact_checks: List[Dict[str, Any]] = []
        for claim in response.get("claims", []):
            if claim.get("claimReview"):
                # The API can return multiple claim reviews for one claim
                for review in claim["claimReview"]:
                    fact_checks.append({
                        "textual_rating": review.get("textualRating"),
                        "title": review.get("title"),
                        "publisher": review.get("publisher", {}).get("name"),
                        "url": review.get("url"),
                        "review_date": review.get("reviewDate"),
                        "claim_text": claim.get("text"),
                        "claim_author": claim.get("claimant"),
                    })
        logger.info(f"Successfully performed fact-check search for query: '{query}'")
        return fact_checks
    except HttpError as e:
        logger.error(f"Google Fact Check API HTTP error for query '{query}': {e.resp.status} - {e.content}")
        if e.resp.status == 403:
             logger.error("Possible API key issue or quota exceeded for Google Fact Check API.")
        return []
    except Exception as e:
        logger.error(f"An unexpected error occurred during Google Fact Check API search for query '{query}': {e}")
        return []

# Example Usage (for testing)
if __name__ == "__main__":
    # To run this example, set GOOGLE_FACT_CHECK_API_KEY in your .env file
    # and install: pip install google-api-python-client
    async def main():
        settings.GOOGLE_FACT_CHECK_API_KEY = os.getenv("GOOGLE_FACT_CHECK_API_KEY", "YOUR_API_KEY_HERE")
        if settings.GOOGLE_FACT_CHECK_API_KEY == "YOUR_API_KEY_HERE":
            print("Please set GOOGLE_FACT_CHECK_API_KEY in your .env or as an environment variable to test.")
            return

        print("Searching for fact checks on 'vaccines cause autism'...")
        results = await search_for_fact_checks("vaccines cause autism")
        if results:
            for i, fc in enumerate(results):
                print(f"\n--- Fact Check {i+1} ---")
                print(f"Claim: {fc.get('claim_text')}")
                print(f"Verdict: {fc.get('textual_rating')}")
                print(f"Publisher: {fc.get('publisher')}")
                print(f"URL: {fc.get('url')}")
        else:
            print("No fact checks found.")
            
    import asyncio
    asyncio.run(main())