import json
import asyncio
from typing import List, Dict, Any, Optional
from groq import Groq
from loguru import logger

from backend.config import settings
from backend.utils.key_rotator import KeyRotator
from backend.models import UnifiedReportSchema, EthicalNotes, ClaimAnalysis, FrameAnalysis

groq_aggregator_rotator = KeyRotator(settings.GROQ_API_KEYS)

async def aggregate_and_reason(
    input_type: str,
    raw_transcript: Optional[str] = None,
    vision_findings: Optional[List[str]] = None,
    fact_check_results: Optional[List[Dict[str, Any]]] = None,
    processing_path: str = ""
) -> Dict[str, Any]:
    """
    Acts as the 'Final Judge' using a high-reasoning LLM to analyze raw evidence 
    across modalities and provide a transparent, weighted credibility score.
    """
    if not settings.GROQ_API_KEYS:
        return {"error": "Aggregator failed: No API keys."}

    # Prepare the evidence context for the LLM
    evidence_context = f"Input Type: {input_type}\n"
    if raw_transcript:
        evidence_context += f"Transcript Findings: {raw_transcript}\n"
    if vision_findings:
        evidence_context += f"Visual Artifacts Found: {', '.join(vision_findings)}\n"
    if fact_check_results:
        evidence_context += f"Fact-Check Matches: {json.dumps(fact_check_results)}\n"

    prompt = f"""
    You are the Senior Intelligence Analyst for TruthLens. Your job is to analyze multimodal evidence and produce a final credibility report.
    
    EVIDENCE TO ANALYZE:
    ---
    {evidence_context}
    ---

    YOUR TASK:
    1. Evaluate the consistency between audio, visual, and factual data.
    2. Assign a Credibility Score (0-100). 
    3. Provide a 'Scoring Breakdown' (reasoning chain) showing exactly how you gained or lost points.
    4. Determine the final verdict (LIKELY TRUE, LIKELY MISLEADING, or UNVERIFIED).
    5. Write a concise natural language summary.

    CRITICAL REQUIREMENTS:
    - Never assume a factual claim is TRUE unless explicitly supported by a Fact-Check Match or overwhelming verifiable evidence.
    - If specific factual claims were made, but "Fact-Check Matches" returned empty or no results, you MUST default to an "UNVERIFIED" verdict and explicitly cite the lack of independent verification.
    - If the "Transcript Findings" contain logical fallacies or emotional manipulation, heavily penalize the credibility score regardless of factuality, and consider a "LIKELY MISLEADING" verdict based on deceptive rhetoric.
    - IF "Visual Artifacts Found" contains ANY indications of AI-generation, deepfakes, or digital manipulation: You MUST set the verdict to "LIKELY MISLEADING" and the credibility score MUST be below 40, explicitly citing the forensic visual evidence as the primary reason.
    - YOUR CONFIDENCE SCORE MUST BE EXPLAINED: In the reasoning_chain, you must include a bullet point specifically detailing *why* your confidence score is what it is (e.g., "Confidence is 0.9 because the video visual analysis strongly aligns with the transcribed audio and fact checks").
    - Output ONLY a valid JSON object with these exact keys:
      'verdict', 'credibility_score', 'confidence', 'summary', 'reasoning_chain' (list of strings), 'red_flags' (list of strings).

    JSON FORMAT:
    {{
      "verdict": "string",
      "credibility_score": int,
      "confidence": float,
      "summary": "string",
      "reasoning_chain": ["string"],
      "red_flags": ["string"]
    }}
    """

    retries = 2
    for attempt in range(retries):
        api_key = groq_aggregator_rotator.get_key()
        try:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile", # Switched from decommissioned specdec
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.0 # Force consistency
            )
            completion_text = completion.choices[0].message.content
            cleaned_text = completion_text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            result = json.loads(cleaned_text.strip())
            result["raw_response"] = completion_text
            
            logger.info("Aggregation reasoning completed successfully.")
            return result
        except Exception as e:
            logger.error(f"Aggregator attempt {attempt+1} failed: {e}")
            await asyncio.sleep(1)
    
    return {
        "verdict": "UNVERIFIED",
        "credibility_score": 50,
        "confidence": 0.0,
        "summary": "The aggregation engine failed to reach a conclusion due to a processing error.",
        "reasoning_chain": ["Error in reasoning engine."],
        "red_flags": ["Aggregation failure"],
        "raw_response": "Aggregation failed due to exceptions in Groq API."
    }
