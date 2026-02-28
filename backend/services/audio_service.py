import os
import asyncio
from typing import List, Dict, Any
from fastapi import UploadFile
from groq import Groq

from backend.config import settings
from backend.utils.key_rotator import KeyRotator
from backend.models import UnifiedReportSchema, EthicalNotes, ClaimAnalysis
from backend.services.text_service import analyze_text_with_groq_llm
from loguru import logger

# Initialize key rotators
groq_key_rotator = KeyRotator(settings.GROQ_API_KEYS)

async def _transcribe_audio_with_groq(audio_path: str) -> str:
    """
    Transcribes audio using Groq's Whisper API.
    """
    if not settings.GROQ_API_KEYS:
        logger.error("No Groq API keys configured for audio transcription.")
        return "Audio transcription failed: No API keys."

    retries = 3
    for attempt in range(retries):
        groq_api_key = groq_key_rotator.get_key()
        try:
            client = Groq(api_key=groq_api_key)
            with open(audio_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    file=("audio.mp3", audio_file.read()),
                    model="whisper-large-v3"
                )
            logger.info(f"Audio transcription successful with Groq key {groq_api_key[:5]}...")
            return transcript.text
        except Exception as e:
            logger.error(f"Groq API transcription failed (attempt {attempt+1}/{retries}) with key {groq_api_key[:5]}: {e}")
            if "rate limit" in str(e).lower() or "429" in str(e):
                groq_key_rotator.mark_key_as_rate_limited(groq_api_key)
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt) # Exponential backoff
            else:
                return f"Audio transcription failed after multiple attempts: {e}"
    return "Audio transcription failed unexpectedly."

async def process_audio_for_analysis(audio_file: UploadFile) -> UnifiedReportSchema:
    """
    Processes an audio file, transcribes it, and analyzes it for misinformation.
    """
    temp_audio_path = f"temp_{audio_file.filename}"
    
    # Save the uploaded audio file temporarily
    logger.info(f"Saving uploaded audio to {temp_audio_path}")
    contents = await audio_file.read()
    with open(temp_audio_path, "wb") as f:
        f.write(contents)

    transcript = ""
    claims_analyzed: List[ClaimAnalysis] = []
    red_flags: List[str] = []
    verdict = "UNVERIFIED"
    credibility_score = 50
    confidence = 0.5

    try:
        transcript = await _transcribe_audio_with_groq(temp_audio_path)
    finally:
        # Clean up temporary file
        logger.info(f"Cleaning up temporary file {temp_audio_path}")
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

    # --- Aggregation and Report Generation ---
    summary_parts = []
    reasoning_chain: List[str] = []
    
    if transcript and "Audio transcription failed" not in transcript:
        # Feed transcript to the LLM analyzer to get deterministic JSON scores and reasoning
        llm_analysis = await analyze_text_with_groq_llm(transcript)
        
        summary_parts.append(f"Audio transcript excerpt: '{transcript[:150]}{'...' if len(transcript) > 150 else ''}'")
        
        if "Text analysis failed" not in llm_analysis.get("summary", ""):
            verdict = llm_analysis.get("overall_verdict", "UNVERIFIED")
            credibility_score = llm_analysis.get("credibility_score", 50)
            confidence = llm_analysis.get("confidence", 0.5)
            reasoning_chain = llm_analysis.get("reasoning_chain", ["No detailed reasoning provided."])
            
            # Extract claims and red flags from the LLM JSON
            for claim_data in llm_analysis.get("claims_analyzed", []):
                claims_analyzed.append(ClaimAnalysis(**claim_data))
                
            red_flags.extend(llm_analysis.get("red_flags", []))
            summary_parts.append(llm_analysis.get("summary", ""))
        else:
            red_flags.append("Warning: LLM analysis of the transcript failed. Using transcription only.")
            summary_parts.append("Could not perform deep linguistic verification on the transcript.")
            reasoning_chain.append("Analysis failed due to LLM error. No score calculated.")

    else:
        summary_parts.append(transcript) 
        red_flags.append("Failed to accurately transcribe or analyze audio content.")
        reasoning_chain.append("No transcription generated due to an error.")
        credibility_score = 0
        confidence = 0.0

    final_summary = " ".join(summary_parts) if summary_parts else "No discernible content for analysis."

    ethical_notes = EthicalNotes(
        bias_warning="AI analysis can contain biases. Verify critical information.",
        confidence_note="This report is based on automated analysis and should be used as a guide."
    )

    return UnifiedReportSchema(
        verdict=verdict,
        credibility_score=credibility_score,
        confidence=confidence,
        summary=final_summary,
        reasoning_chain=reasoning_chain,
        analysis_model="Whisper-large-v3 + Llama3-8b",
        api_used="Groq",
        claims_analyzed=claims_analyzed,
        red_flags=red_flags,
        ethical_notes=ethical_notes,
        input_type="audio",
        processing_path="audio_service.py",
    )
