import os
import cv2
import asyncio
import base64 # Added for base64 encoding of images
import json
from moviepy.video.io.VideoFileClip import VideoFileClip
from typing import List, Dict, Any, Tuple
from fastapi import UploadFile
from groq import Groq # Import Groq client

from backend.config import settings
from backend.utils.key_rotator import KeyRotator
from backend.utils.cache import app_cache
from backend.models import UnifiedReportSchema, EthicalNotes, FrameAnalysis, ClaimAnalysis
from backend.services.factcheck_service import search_for_fact_checks # Import fact-check service
from backend.services.aggregator import aggregate_and_reason # Import aggregator
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
                # The Groq API expects a tuple for the file in the `files` parameter
                transcript = client.audio.transcriptions.create(
                    file=("audio.mp3", audio_file.read()),
                    model="whisper-large-v3" # Use the specified model
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

async def _analyze_frame_with_groq_vision(image_path: str, prompt: str) -> Dict[str, Any]:
    """
    Analyzes an image frame using Groq's Llama-3.2 Vision model.
    """
    if not settings.GROQ_API_KEYS:
        return {"error": "No API keys."}

    groq_api_key = groq_key_rotator.get_key()
    try:
        client = Groq(api_key=groq_api_key)
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")

        completion = client.chat.completions.create(
            model=settings.DEFAULT_VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                    ],
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
            max_tokens=512,
        )
        
        response_content = completion.choices[0].message.content
        cleaned_text = response_content.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        return json.loads(cleaned_text.strip())
    except Exception as e:
        logger.error(f"Frame analysis failed: {e}")
        return {"error": str(e)}

async def process_video_for_analysis(video_file: UploadFile) -> UnifiedReportSchema:
    """
    Processes a video file, extracting frames and audio for analysis using Groq services.
    """
    temp_video_path = f"temp_{video_file.filename}"
    temp_audio_path = f"temp_audio_{video_file.filename}.mp3"
    temp_frames_dir = f"temp_frames_{video_file.filename.split('.')[0]}"
    
    # Save the uploaded video file temporarily
    logger.info(f"Saving uploaded video to {temp_video_path}")
    contents = await video_file.read()
    with open(temp_video_path, "wb") as f:
        f.write(contents)

    transcript = ""
    frames_analyzed_count = 0
    manipulation_detected = False
    ai_generated_score = 0.0
    artifacts_found: List[str] = []

    try:
        # Extract audio
        logger.info(f"Extracting audio from {temp_video_path}")
        video_clip = VideoFileClip(temp_video_path)
        audio_clip = video_clip.audio
        audio_clip.write_audiofile(temp_audio_path, logger=None)
        audio_clip.close()
        video_clip.close()

        transcript = await _transcribe_audio_with_groq(temp_audio_path)

        # Extract frames and analyze
        os.makedirs(temp_frames_dir, exist_ok=True)
        vidcap = cv2.VideoCapture(temp_video_path)
        fps = vidcap.get(cv2.CAP_PROP_FPS)
        # Sample 3 frames across the video to respect rate limits
        total_frames = int(vidcap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_indices = [0, total_frames // 2, total_frames - 1]
        
        vision_prompt = """
        You are a Senior Video Forensic Analyst. Examine this video frame for signs of AI generation, deepfakes, or digital manipulation.
        
        CRITICAL SCUTINY CHECKLIST:
        1. TEMPORAL COHERENCE: Does the subject look "natural" or like a generated overlay?
        2. ANATOMICAL IRREGULARITIES: Check eyes, teeth, and skin texture.
        3. ARTIFACTS: Look for pixelation, unnatural blurring, or merging of objects.
        
        Output your analysis in a structured JSON format:
        - "verdict": "LIKELY MISLEADING" (if manipulation detected), "UNVERIFIED", or "LIKELY TRUE".
        - "credibility_score": Integer (0-100).
        - "reasoning_chain": [3-5 forensic bullet points].
        - "artifacts": [List of specific artifacts found].
        - "manipulation_detected": boolean.
        - "ai_generated_score": float (0.0 to 1.0).
        """
        
        for idx in frame_indices:
            vidcap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            success, image = vidcap.read()
            if success:
                frame_path = os.path.join(temp_frames_dir, f"frame_{idx}.jpg")
                cv2.imwrite(frame_path, image)
                frames_analyzed_count += 1
                
                res = await _analyze_frame_with_groq_vision(frame_path, vision_prompt)
                if res.get("manipulation_detected"):
                    manipulation_detected = True
                    artifacts_found.extend(res.get("artifacts", []))
                    ai_generated_score = max(ai_generated_score, res.get("ai_generated_score", 0.0))

        vidcap.release()
        
    finally:
        # Clean up
        if os.path.exists(temp_video_path): os.remove(temp_video_path)
        if os.path.exists(temp_audio_path): os.remove(temp_audio_path)
        if os.path.exists(temp_frames_dir):
            for f in os.listdir(temp_frames_dir): os.remove(os.path.join(temp_frames_dir, f))
            os.rmdir(temp_frames_dir)

    # --- Aggregation and Reasoning via 70b LLM ---
    fact_checks = await search_for_fact_checks(transcript[:500]) if transcript else []

    reasoned_result = await aggregate_and_reason(
        input_type="video",
        raw_transcript=transcript,
        vision_findings=artifacts_found,
        fact_check_results=fact_checks,
        processing_path="video_service.py -> Groq Aggregator"
    )

    frame_analysis_data = FrameAnalysis(
        frames_analyzed=frames_analyzed_count,
        manipulation_detected=manipulation_detected,
        ai_generated_score=ai_generated_score,
        artifacts_found=artifacts_found or ["No specific visual artifacts detected."]
    )

    final_claims = [ClaimAnalysis(claim=fc.get("claim_text", ""), verdict=fc.get("textual_rating", ""), source=fc.get("url", ""), explanation="Factual check") for fc in fact_checks]

    return UnifiedReportSchema(
        verdict=reasoned_result.get("verdict", "UNVERIFIED"),
        credibility_score=reasoned_result.get("credibility_score", 50),
        confidence=reasoned_result.get("confidence", 0.5),
        reasoning_chain=reasoned_result.get("reasoning_chain", ["Reasoning data unavailable."]),
        analysis_model=f"Whisper + {settings.DEFAULT_VISION_MODEL} + {settings.DEFAULT_TEXT_MODEL}",
        api_used="Groq API (LPU Multimodal)",
        summary=reasoned_result.get("summary", "Analysis completed."),
        claims_analyzed=final_claims,
        red_flags=reasoned_result.get("red_flags", []),
        frame_analysis=frame_analysis_data,
        ethical_notes=EthicalNotes(bias_warning="AI analysis can contain biases.", confidence_note="Full Groq Pipeline."),
        input_type="video",
        processing_path="video_service.py -> Groq LPU",
    )
