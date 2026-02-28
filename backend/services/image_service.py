import os
import asyncio
import base64
import json
from typing import Dict, Any, List
from fastapi import UploadFile
from groq import Groq
from loguru import logger

from backend.config import settings
from backend.utils.key_rotator import KeyRotator
from backend.models import UnifiedReportSchema, EthicalNotes, FrameAnalysis

# Use Groq for Vision now
groq_vision_key_rotator = KeyRotator(settings.GROQ_API_KEYS)

async def _analyze_image_with_groq_vision(image_path: str, prompt: str) -> Dict[str, Any]:
    """
    Analyzes an image using Groq's Llama-3.2 Vision model.
    Provides a free-tier alternative to OpenRouter.
    """
    if not settings.GROQ_API_KEYS:
        logger.error("No Groq API keys configured for vision analysis.")
        return {"error": "Vision analysis failed: No API keys."}

    retries = 3
    for attempt in range(retries):
        api_key = groq_vision_key_rotator.get_key()
        try:
            client = Groq(api_key=api_key)

            # Convert image to base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode("utf-8")

            # Groq uses standard OpenAI-style vision messages
            completion = client.chat.completions.create(
                model=settings.DEFAULT_VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                },
                            },
                        ],
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.0, # Deterministic
                max_tokens=1024,
            )
            
            response_content = completion.choices[0].message.content
            logger.info(f"Groq Vision analysis successful with key {api_key[:5]}...")
            
            # Clean and parse JSON
            cleaned_text = response_content.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            parsed_json = json.loads(cleaned_text.strip())
            parsed_json["raw_response"] = response_content
            return parsed_json

        except Exception as e:
            logger.error(f"Groq Vision analysis failed (attempt {attempt+1}/{retries}): {e}")
            if "rate limit" in str(e).lower() or "429" in str(e):
                groq_vision_key_rotator.mark_key_as_rate_limited(api_key)
            if attempt < retries - 1:
                await asyncio.sleep(2 ** attempt)
            else:
                return {"error": f"Groq Vision analysis failed after multiple attempts: {e}"}
    return {"error": "Groq Vision analysis failed unexpectedly."}

async def process_image_for_analysis(image_file: UploadFile) -> UnifiedReportSchema:
    """
    Processes a single image file for misinformation and synthetic origins using Groq Vision.
    """
    temp_image_path = f"temp_{image_file.filename}"
    
    logger.info(f"Saving uploaded image to {temp_image_path}")
    contents = await image_file.read()
    with open(temp_image_path, "wb") as f:
        f.write(contents)

    manipulation_detected = False
    ai_generated_score = 0.0
    artifacts_found: List[str] = []
    
    vision_prompt = """
    You are a Senior Digital Forensic Analyst. Your task is to perform a rigorous scrutiny of the provided image to identify if it is AI-generated, digitally manipulated, or a deepfake.
    
    CRITICAL SCUTINY CHECKLIST:
    1. ANATOMICAL ERRORS: Check for irregularities in eyes, ears, hands, and teeth (e.g., mismatched pupils, unnatural finger counts).
    2. TEXTURE & SMOOTHING: Look for "over-perfect" skin, plastic-like textures, or inconsistent digital noise.
    3. LIGHTING & SHADOWS: Detect mismatched light sources or shadows that don't align with objects.
    4. EDGE ARTIFACTS: Identify unnatural "glow" or blurring around subject hair or clothing edges.
    
    If you find ANY of these, you MUST be critical. DO NOT default to 'LIKELY TRUE' if there is any doubt.
    
    Output your analysis in a structured JSON format:
    - "verdict": "LIKELY MISLEADING" (if AI detected), "UNVERIFIED" (if unsure), or "LIKELY TRUE" (if purely organic).
    - "credibility_score": Integer (0-100). (Score < 40 if any AI artifact is found).
    - "reasoning_chain": [3-5 forensic observations].
    - "artifacts_found": [Specific list of artifacts detected].
    - "manipulation_detected": boolean.
    - "ai_generated_score": float (0.0 to 1.0).
    """

    try:
        vision_result = await _analyze_image_with_groq_vision(temp_image_path, vision_prompt)
    finally:
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)

    verdict = vision_result.get("verdict", "UNVERIFIED")
    credibility_score = vision_result.get("credibility_score", 50)
    reasoning_chain = vision_result.get("reasoning_chain", ["No detailed reasoning was provided by the model."])
    artifacts_found = vision_result.get("artifacts_found", [])
    manipulation_detected = vision_result.get("manipulation_detected", False)
    ai_generated_score = vision_result.get("ai_generated_score", 0.0)
    raw_response = vision_result.get("raw_response", None)

    ethical_notes = EthicalNotes(
        bias_warning="AI analysis can contain biases. Verify critical information.",
        confidence_note="Analysis powered by Groq LPU Vision technology."
    )
    
    frame_analysis_data = FrameAnalysis(
        frames_analyzed=1,
        manipulation_detected=manipulation_detected,
        ai_generated_score=ai_generated_score,
        artifacts_found=artifacts_found or ["No specific visual artifacts detected."]
    )

    return UnifiedReportSchema(
        verdict=verdict,
        credibility_score=credibility_score,
        confidence=0.9, # Vision model confidence
        summary=f"Forensic vision analysis detected {len(artifacts_found)} artifacts.",
        reasoning_chain=reasoning_chain,
        analysis_model=settings.DEFAULT_VISION_MODEL,
        api_used="Groq API (LPU Vision)",
        claims_analyzed=[], 
        red_flags=["Visual manipulation detected"] if manipulation_detected else [],
        frame_analysis=frame_analysis_data,
        ethical_notes=ethical_notes,
        input_type="image",
        processing_path="image_service.py -> Groq Vision",
        raw_response=raw_response,
    )
