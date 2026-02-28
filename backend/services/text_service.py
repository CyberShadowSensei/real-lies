import asyncio
import json
from typing import Dict, Any, List
from groq import Groq
from loguru import logger

from backend.config import settings
from backend.utils.key_rotator import KeyRotator
from backend.models import ClaimAnalysis
from backend.services.factcheck_service import search_for_fact_checks # Import fact-check service
from backend.services.aggregator import aggregate_and_reason # Import aggregator

groq_llm_key_rotator = KeyRotator(settings.GROQ_API_KEYS)

async def analyze_text_with_groq_llm(text_content: str) -> Dict[str, Any]:
    """
    Analyzes text content using Groq's LLAMA-3.3-70b LLM.
    The prompt is designed to extract claims, determine verdict, and provide a summary.
    """
    if not settings.GROQ_API_KEYS:
        logger.error("No Groq API keys configured for text analysis.")
        return {"summary": "Text analysis failed: No API keys."}

    prompt = f"""
    You are the Lead Forensic Analyst for TruthLens. Analyze the provided text for both factual claims and linguistic integrity.

    PHASE 1: LOGICAL INTEGRITY ANALYSIS
    Identify logical fallacies (ad hominem, strawman, slippery slope, etc.), emotional manipulation, and sensationalist rhetoric. 
    Deduct points from the 100-point base score for each instance of deceptive language.

    PHASE 2: FACTUAL EXTRACTION
    Identify 1-3 specific factual claims that can be independently verified. 

    OUTPUT REQUIREMENTS:
    - "reasoning_chain": MUST contain 3-5 analytical points. At least 2 points MUST focus on the logical fallacies or emotional tone detected.
    - "overall_verdict": Must be LIKELY TRUE, LIKELY MISLEADING, or UNVERIFIED.
    - "credibility_score": Integer (0-100). Be strict. 

    Output ONLY valid JSON.

    Text to analyze:
    ---
    {text_content}
    ---
    """

    retries = 3
    for attempt in range(retries):
        groq_api_key = groq_llm_key_rotator.get_key()
        try:
            client = Groq(api_key=groq_api_key)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile", # Switched from decommissioned specdec
                response_format={"type": "json_object"},
                temperature=0.0, # Deterministic results
                max_tokens=2048,
            )
            response_content = chat_completion.choices[0].message.content
            logger.info(f"Groq LLM text analysis successful with key {groq_api_key[:5]}...")
            
            # Attempt to parse the JSON response
            import json
            cleaned_text = response_content.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            parsed_response = json.loads(cleaned_text.strip())

            # --- Integrate Fact Check ---
            # For each claim identified by the LLM, perform a fact-check
            updated_claims = []
            for claim_data in parsed_response.get("claims_analyzed", []):
                claim_text = claim_data.get("claim")
                if claim_text:
                    fact_checks = await search_for_fact_checks(claim_text)
                    if fact_checks:
                        # Incorporate the first relevant fact-check result
                        fc = fact_checks[0]
                        claim_data["verdict"] = fc.get("textual_rating", claim_data["verdict"])
                        claim_data["source"] = fc.get("url", claim_data["source"])
                        claim_data["explanation"] = f"Fact-checked: {fc.get('title')} ({fc.get('publisher')}). {claim_data['explanation']}"
                        if "MISLEADING" in claim_data["verdict"].upper() and "red_flags" not in parsed_response:
                            parsed_response["red_flags"] = parsed_response.get("red_flags", []) + [f"Fact-check found for claim: '{claim_text}'"]
                    else:
                        if "red_flags" not in parsed_response:
                             parsed_response["red_flags"] = parsed_response.get("red_flags", []) + [f"No external fact-check found for claim: '{claim_text}'"]
                updated_claims.append(claim_data)
            parsed_response["claims_analyzed"] = updated_claims
            # --- End Integrate Fact Check ---

            # Use the Aggregator to perform final reasoning and scoring
            reasoned_result = await aggregate_and_reason(
                input_type="text",
                raw_transcript=text_content, # Using the original text as the transcript context
                fact_check_results=parsed_response.get("claims_analyzed", []),
                processing_path="text_service.py -> aggregator.py"
            )
            
            # Merge the aggregator's findings with the extracted claims
            parsed_response.update(reasoned_result)
            parsed_response["analysis_model"] = "llama3-8b-8192 + Llama-3.3-70b"
            parsed_response["api_used"] = "Groq"
            parsed_response["raw_response"] = f"--- Extraction Phase ---\n{response_content}\n\n--- Aggregation Phase ---\n{reasoned_result.get('raw_response', 'N/A')}"
            return parsed_response
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON from Groq LLM (attempt {attempt+1}/{retries}): {e} - Response: {response_content}")
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                return {"summary": f"Text analysis failed: Invalid JSON response. Error: {e}"}
        except Exception as e:
            logger.error(f"Groq API text analysis failed (attempt {attempt+1}/{retries}) with key {groq_api_key[:5]}: {e}")
            if "rate limit" in str(e).lower() or "429" in str(e):
                groq_llm_key_rotator.mark_key_as_rate_limited(groq_api_key)
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                return {"summary": f"Text analysis failed after multiple attempts: {e}"}
    return {"summary": "Text analysis failed unexpectedly."}
